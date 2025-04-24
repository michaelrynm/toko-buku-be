// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await req.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        name: order.name,
        email: order.email,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          book: item.book,
        })),
      })),
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await req.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        orderItems: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        name: order.name,
        email: order.email,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          book: item.book,
        })),
      },
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving order",
      error: error.message,
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, shippingAddress, paymentMethod, items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Fetch books to validate and calculate total
    const bookIds = items.map((item) => item.bookId);
    const books = await req.prisma.book.findMany({
      where: {
        id: { in: bookIds },
      },
    });

    // Validate books and stock
    for (const item of items) {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Book with ID ${item.bookId} not found`,
        });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for book "${book.title}". Available: ${book.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      const book = books.find((b) => b.id === item.bookId);
      return sum + book.price * item.quantity;
    }, 0);

    // Create order with transaction to ensure atomicity
    const order = await req.prisma.$transaction(async (prisma) => {
      // 1. Create the order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          name,
          email,
          shippingAddress,
          paymentMethod,
          totalAmount,
          orderItems: {
            create: items.map((item) => {
              const book = books.find((b) => b.id === item.bookId);
              return {
                bookId: item.bookId,
                quantity: item.quantity,
                price: book.price,
              };
            }),
          },
        },
        include: {
          orderItems: {
            include: {
              book: true,
            },
          },
        },
      });

      // 2. Update book stock
      for (const item of items) {
        const book = books.find((b) => b.id === item.bookId);
        await prisma.book.update({
          where: { id: item.bookId },
          data: { stock: book.stock - item.quantity },
        });
      }

      // 3. Clear cart if order was placed from cart
      if (req.body.clearCart) {
        const cart = await prisma.cart.findUnique({
          where: { userId },
        });

        if (cart) {
          await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order.id,
        name: order.name,
        email: order.email,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          book: item.book,
        })),
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await req.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            book: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Cancel order (user can only cancel their own orders)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find order first to check ownership and current status
    const order = await req.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only allow cancellation for pending or processing orders
    if (order.status !== "PENDING" && order.status !== "PROCESSING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status ${order.status}`,
      });
    }

    // Update order and restore stock in a transaction
    const updatedOrder = await req.prisma.$transaction(async (prisma) => {
      // 1. Get order items
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
        include: { book: true },
      });

      // 2. Update order status
      const updated = await prisma.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: {
          orderItems: {
            include: {
              book: true,
            },
          },
        },
      });

      // 3. Restore book stock
      for (const item of orderItems) {
        await prisma.book.update({
          where: { id: item.bookId },
          data: { stock: item.book.stock + item.quantity },
        });
      }

      return updated;
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};

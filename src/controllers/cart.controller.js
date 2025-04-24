// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart with books
    let cart = await req.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await req.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + item.book.price * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      cart: {
        id: cart.id,
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          book: item.book,
          subtotal: item.book.price * item.quantity,
        })),
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Check if book exists
    const book = await req.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book is in stock
    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Get or create cart
    let cart = await req.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await req.prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    // Check if book already in cart
    const existingItem = await req.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        bookId,
      },
    });

    let cartItem;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > book.stock) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }

      cartItem = await req.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
        },
        include: {
          book: true,
        },
      });
    } else {
      // Add new item to cart
      cartItem = await req.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          bookId,
          quantity,
        },
        include: {
          book: true,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Book added to cart",
      item: {
        id: cartItem.id,
        quantity: cartItem.quantity,
        book: cartItem.book,
        subtotal: cartItem.book.price * cartItem.quantity,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Check if item exists and belongs to user's cart
    const cart = await req.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const cartItem = await req.prisma.cartItem.findFirst({
      where: {
        id,
        cartId: cart.id,
      },
      include: {
        book: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Check if book is in stock
    if (cartItem.book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Update cart item
    const updatedItem = await req.prisma.cartItem.update({
      where: { id },
      data: {
        quantity,
      },
      include: {
        book: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      item: {
        id: updatedItem.id,
        quantity: updatedItem.quantity,
        book: updatedItem.book,
        subtotal: updatedItem.book.price * updatedItem.quantity,
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user's cart
    const cart = await req.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const cartItem = await req.prisma.cartItem.findFirst({
      where: {
        id,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Remove from cart
    await req.prisma.cartItem.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from cart",
      error: error.message,
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart
    const cart = await req.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Delete all items in cart
    await req.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

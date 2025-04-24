// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's wishlist with books
    let wishlist = await req.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    // If wishlist doesn't exist, return a proper message
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found. You can create a wishlist by adding books.",
      });
    }

    // If wishlist exists, return the wishlist and its items
    res.status(200).json({
      success: true,
      wishlist: {
        id: wishlist.id,
        items: wishlist.items.map((item) => ({
          id: item.id,
          book: item.book,
        })),
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving wishlist",
      error: error.message,
    });
  }
};


// Add book to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

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

    // Get or create wishlist
    let wishlist = await req.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await req.prisma.wishlist.create({
        data: {
          userId,
        },
      });
    }

    // Check if book already in wishlist
    const existingItem = await req.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        bookId,
      },
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Book already in wishlist",
      });
    }

    // Add book to wishlist
    const wishlistItem = await req.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        bookId,
      },
      include: {
        book: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Book added to wishlist",
      item: {
        id: wishlistItem.id,
        book: wishlistItem.book,
      },
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
      error: error.message,
    });
  }
};

// Remove book from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user's wishlist
    const wishlist = await req.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const wishlistItem = await req.prisma.wishlistItem.findFirst({
      where: {
        id,
        wishlistId: wishlist.id,
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    // Remove from wishlist
    await req.prisma.wishlistItem.delete({
      where: { id },  
    });

    res.status(200).json({
      success: true,
      message: "Book removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
      error: error.message,
    });
  }
};

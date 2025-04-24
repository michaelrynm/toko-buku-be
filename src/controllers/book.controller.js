// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await req.prisma.book.findMany({
      orderBy: {
        title: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving books",
      error: error.message,
    });
  }
};

exports.getNewReleaseBooks = async (req, res) => {
  try {
    const books = await req.prisma.book.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving books",
      error: error.message,
    });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await req.prisma.book.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Get book by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving book",
      error: error.message,
    });
  }
};

// Search books by title, author, or description
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const books = await req.prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: {
        title: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Search books error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching books",
      error: error.message,
    });
  }
};

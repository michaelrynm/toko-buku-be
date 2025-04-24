// prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing data if needed
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating users...");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: passwordHash,
    },
  });

  console.log("Creating books...");

  // Create books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: "To Kill a Mockingbird",
        description:
          "To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.",
        author: "Harper Lee",
        category: "Programming",
        price: 12.99,
        stock: 50,
        imageUrl: "https://itbook.store/img/books/9781098103828.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "1984",
        description:
          "1984 is a dystopian novel by George Orwell published in 1949. The novel is set in Airstrip One, a province of the superstate Oceania in a world of perpetual war.",
        author: "George Orwell",
        category: "Design",
        price: 10.99,
        stock: 75,
        imageUrl: "https://itbook.store/img/books/9781098104030.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "The Great Gatsby",
        description:
          "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby.",
        author: "F. Scott Fitzgerald",
        category: "Science",
        price: 11.99,
        stock: 30,
        imageUrl: "https://itbook.store/img/books/9781098106225.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "Pride and Prejudice",
        description:
          "Pride and Prejudice is a romantic novel of manners written by Jane Austen in 1813. The novel follows the character development of Elizabeth Bennet.",
        author: "Jane Austen",
        category: "Fiction",
        price: 9.99,
        stock: 20,
        imageUrl: "https://itbook.store/img/books/9781098111878.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "The Hobbit",
        description:
          "The Hobbit, or There and Back Again is a children's fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937.",
        author: "J.R.R. Tolkien",
        category: "Programming",
        price: 14.99,
        stock: 40,
        imageUrl: "https://itbook.store/img/books/9781098112844.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "Harry Potter and the Philosopher's Stone",
        description:
          "Harry Potter and the Philosopher's Stone is a fantasy novel written by British author J. K. Rowling. The first novel in the Harry Potter series.",
        author: "J.K. Rowling",
        category: "Fiction",
        price: 15.99,
        stock: 100,
        imageUrl: "https://itbook.store/img/books/9781098113162.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "The Catcher in the Rye",
        description:
          "The Catcher in the Rye is a novel by J. D. Salinger. A controversial novel originally published for adults, it has since become popular with adolescent readers for its themes of teenage angst and alienation.",
        author: "J.D. Salinger",
        category: "Fiction",
        price: 13.99,
        stock: 25,
        imageUrl: "https://itbook.store/img/books/9781098116743.png",
      },
    }),
    prisma.book.create({
      data: {
        title: "The Lord of the Rings",
        description:
          "The Lord of the Rings is an epic high fantasy novel written by English author J. R. R. Tolkien. The story began as a sequel to Tolkien's 1937 fantasy novel The Hobbit, but eventually developed into a much larger work.",
        author: "J.R.R. Tolkien",
        category: "Fiction",
        price: 24.99,
        stock: 35,
        imageUrl: "https://itbook.store/img/books/9781098119515.png",
      },
    }),
  ]);

  console.log("Creating reviews...");

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "A timeless classic!",
        userId: user1.id,
        bookId: books[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Great dystopian novel that still feels relevant today.",
        userId: user2.id,
        bookId: books[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "My favorite book of all time!",
        userId: user1.id,
        bookId: books[4].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 3,
        comment: "Good but not what I expected.",
        userId: user2.id,
        bookId: books[6].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Magical story for all ages!",
        userId: user1.id,
        bookId: books[5].id,
      },
    }),
  ]);

  console.log("Creating wishlist...");

  // Create wishlists
  const wishlist1 = await prisma.wishlist.create({
    data: {
      userId: user1.id,
    },
  });

  const wishlist2 = await prisma.wishlist.create({
    data: {
      userId: user2.id,
    },
  });

  await Promise.all([
    prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist1.id,
        bookId: books[5].id,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist1.id,
        bookId: books[7].id,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist2.id,
        bookId: books[0].id,
      },
    }),
  ]);

  console.log("Creating carts...");

  // Create carts
  const cart1 = await prisma.cart.create({
    data: {
      userId: user1.id,
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      userId: user2.id,
    },
  });

  await Promise.all([
    prisma.cartItem.create({
      data: {
        cartId: cart1.id,
        bookId: books[2].id,
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: cart1.id,
        bookId: books[3].id,
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        cartId: cart2.id,
        bookId: books[5].id,
        quantity: 1,
      },
    }),
  ]);

  console.log("Creating orders...");

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      shippingAddress: "123 Main St, Anytown, AN 12345",
      paymentMethod: "Credit Card",
      totalAmount: 36.97, // 1x Great Gatsby + 2x Pride and Prejudice
      status: "DELIVERED",
      userId: user1.id,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      shippingAddress: "456 Oak Ave, Somewhere, SO 67890",
      paymentMethod: "PayPal",
      totalAmount: 15.99, // 1x Harry Potter
      status: "SHIPPED",
      userId: user2.id,
    },
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        bookId: books[2].id, // Great Gatsby
        quantity: 1,
        price: books[2].price,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        bookId: books[3].id, // Pride and Prejudice
        quantity: 2,
        price: books[3].price,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: order2.id,
        bookId: books[5].id, // Harry Potter
        quantity: 1,
        price: books[5].price,
      },
    }),
  ]);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

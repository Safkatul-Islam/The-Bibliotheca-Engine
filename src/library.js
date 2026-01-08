const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Book {
    constructor(title, author, isbn, stock) {
        this.title = title;
        this.author = author;
        this.isbn = String(isbn);
        this.stock = stock;
    }
}

class User {
    constructor(name, id, borrowedBooks = []) {
        this.name = name;
        this.id = id;
        this.borrowedBooks = borrowedBooks;
    }
}

class Library{
    constructor() {
        this.books = new Map();
        this.users = new Map();
    }

    addNewBook = async (book) => {
        await wait(1000);  // the wait helper
        
        if(this.books.has(book.isbn)) {
            const existingBook = this.books.get(book.isbn);
            existingBook.stock += book.stock;
            return `Stock updated for ${existingBook.title}`
        }

        this.books.set(book.isbn, book);
        return `Book added: ${book.title}`;
    }

    registerUser = async (user) => {
        await wait(1000);

        if(this.users.has(user.id)) {
            throw new Error (`User ID: ${user.id} already exists`);
        }

        this.users.set(user.id, user);
        return `User registered: ${user.name}`;
    }

    borrowBooks = async (userId, isbn) => {
        await wait(1000);

        // Validations
        if(!(this.users.has(userId))) {
            throw new Error(`User with ID: ${userId} doesn't exist`);
        }

        if(!(this.books.has(isbn))) {
            throw new Error(`Book with ID: ${isbn} doesn't exist`);
        }

        const book = this.books.get(isbn);

        if(book.stock <= 0) {
            throw new Error("Book is currently unavailable");
        }

        // Decrease stock
        book.stock -= 1;

        // Create Due Date 
        const due = new Date();
        due.setDate(due.getDate() + 14);

        // For testing late fees
        // due.setDate(due.getDate() - 30); // set to 15 days ago

        const borrowRecord = {
            isbn: isbn,
            title: book.title,
            dueDate: due
        }

        this.users.get(userId).borrowedBooks.push(borrowRecord);
        return `Checkout Successful. Due: ${due.toDateString()}`;
    }

    returnBooks = async (userId, isbn) => {
        await wait(1000);

        // Validations
        if(!(this.users.has(userId))) {
            throw new Error(`User with ID: ${userId} doesn't exist`);
        }

        if(!(this.books.has(isbn))) {
            throw new Error(`Book with ID: ${isbn} doesn't exist`);
        }

        const user = this.users.get(userId);

        // Find the borrowed books in user's array
        const borrowedBook = user.borrowedBooks.find(book => book.isbn === isbn);

        if(!(borrowedBook)) {
            throw new Error(`User with ID: ${userId} doesn't have this book`);
        }

        // Increase stock
        const book = this.books.get(isbn);
        book.stock += 1;

        // Removed the book from the users borrowed books array
        user.borrowedBooks = user.borrowedBooks.filter(book => book.isbn !== isbn);

        // Late fee calculation
        const today = new Date();
        const dueDate = borrowedBook.dueDate;

        if(today > dueDate) {
            const msPerDay = 1000 * 60 * 60 * 24;
            const daysLate = Math.floor((today - dueDate) / msPerDay);
            const lateFee = daysLate * 0.50;

            return `Return successful. Late fee: $${lateFee.toFixed(2)}`;
        }

        return "Return Successful";
    }
}

const initSystem = async () => {
    const library = new Library();

    const book1 = new Book("Harry Potter", "Harry", "1", 10);
    const book2 = new Book("48 Laws of Power", "Robert Greene", "2", 50);
    const book3 = new Book("Harry Potter Vol 2", "Harry", "1", 5); // Duplicate ISBN

    const user1 = new User("Daniel", 202, []);
    const user2 = new User("James", 203, []); // Duplicate ID

    try {
        // Add Books
        console.log(await library.addNewBook(book1));
        console.log(await library.addNewBook(book2));
        console.log(await library.addNewBook(book3));

        // Register User
        console.log(await library.registerUser(user1));
        console.log(await library.registerUser(user2));

        // Borrow Test and Return Test
        console.log("\n---Borrow Test ---");
        console.log(await library.borrowBooks(user1.id, book1.isbn));

        console.log("\n---Return Test ---");
        console.log(await library.returnBooks(user1.id, book1.isbn));

        // Test Late fee
        console.log("\n---Late fee test Test ---");
        console.log(await library.borrowBooks(user1.id, book2.isbn));
        console.log(await library.returnBooks(user1.id, book2.isbn));

    } catch (error) {
        console.error(error.message);
    }
}

initSystem();
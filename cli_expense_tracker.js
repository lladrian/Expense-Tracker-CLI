

const fs = require('fs');
const path = require('path');

// Path to the JSON file acting as a database
const dbFilePath = path.resolve(__dirname, 'db.json');


function printUsage() {
    console.log('Usage: node cli_expense_tracker.js <command> [options]');
    console.log('Commands:');
    console.log('  add <description> <amount> <category>          Add a new item with description, amount and category.');
    console.log('  delete <id>                                    Delete the item with the specified ID.');
    console.log('  update <id> <description> <amount> <category>  Update the item with the specified ID.');
    console.log('  list                                           List all items.');
    console.log('  list <category>                                List items that are filtered by the category.');
    console.log('  summary                                        Summary of all expenses.');
    console.log('  summary <month>                                Summary of all expenses for a specific month (of current year).');
    console.log('  export                                         Export expenses to a CSV file.');
    console.log('  help                                           Show this help message.');
}

// Helper function to load data from the JSON file
function loadData() {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist or is empty, return empty array
    if (err.code === 'ENOENT') {
      return [];
    } else {
      console.error('Error reading database file:', err.message);
      process.exit(1);
    }
  }
}

// Helper function to save data to the JSON file
function saveData(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database file:', err.message);
    process.exit(1);
  }
}

function getFormattedDate() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(now.getDate()).padStart(2, '0');
  
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

function list_by_category(category) {
    const data = loadData();  
   
  //  const task = data.find(t => t.category == category);
    const task = category ? data.filter(t => t.category.toString().toLowerCase() === category.toString().toLowerCase()) : "";
   // const task = data.filter(t => t.category.toString().toLowerCase() === category.toString().toLowerCase());
    //const task = data.filter(t => t.category && t.category.toString().toLowerCase() === (category ? category.toString().toLowerCase() : ""))
    // Convert the result to an array to get the length
   // const taskArray = task ? [task] : []; // If task is found, wrap it in an array; otherwise, use an empty array

     if(category == "" || category == undefined) {
        return data;
        //return JSON.stringify(data, null, 2);
    }

    if (task.length === 0) {
        //return JSON.stringify(taskArray, null, 2);
        return task;
    } 
    return task;
  
    //return JSON.stringify(task, null, 2);
   // return JSON.parse(task);
  }


function add_expense(description, amount, category) {
    const data = loadData();

    const newExpense = {
        id: data.length + 1, // Simple ID generation
        description: description,
        amount : parseFloat(amount),
        category : category ? category : "personal",
        date: getFormattedDate()
    };

    if(amount >= 0 ) {
        data.push(newExpense);
        saveData(data);

        console.log(`Expense added successfully (ID: ${newExpense.id})`);
    } else {
        console.log(`Expense failed to add with amount: ${amount}`);
    }
  }

function update_expense(id, description, amount, category) {
    const data = loadData();
    const expense = data.find(t => t.id === parseInt(id));

    if (!expense) {
      console.log(`Expense with ID ${id} not found.`);
      process.exit(1);
    }

    expense.description = description ? description : expense.description;
    expense.amount = amount ? parseFloat(amount) : parseFloat(expense.amount);
    expense.category = category ? category : expense.category;


     if(amount >= 0 ) {
        saveData(data);
        console.log(`Updated item: "${JSON.stringify(expense, null, 2)}"`);
    } else {
        console.log(`Expense failed to update with amount: ${amount}`);
    }

}

function delete_expense(id) {
    const data = loadData();
    const itemIndex = data.findIndex(i => i.id === parseInt(id));

    if (isNaN(id)) {
      console.log('Please provide a valid ID to delete.');
      process.exit(1);
    }

    if (itemIndex === -1) {
        console.log(`Expense with ID ${id} not found.`);
        process.exit(1);
    }
 
    const removed = data.splice(itemIndex, 1);
    saveData(data);

    console.log(`Deleted expense: "${JSON.stringify(removed[0], null, 2)}"`);
}

function formatExpenseList(expenses) {
    let output = "# ID    Date        Category      Description         Amount\n";
    expenses.forEach(expense => {
        const id = expense.id;
        const date = expense.date ? expense.date.split(" ")[0] : "";
        const category = (expense.category || "").padEnd(13);
        const description = (expense.description || "").padEnd(18);
        const amount = expense.amount !== undefined ? `$${expense.amount.toFixed(2)}`.padStart(7) : "";
        output += `# ${id}     ${date}  ${category} ${description}  ${amount}\n`;
    });
    return output;
}


function list_expense(category_command) {
      console.log(formatExpenseList(list_by_category(category_command)));
}

const parseArgs = () => {
    const args = process.argv.slice(2);
    const command = args[0];
    const options = {};
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            options[key] = args[i + 1];
            i++;
        }
    }
    return { command, options };
};

const summaryExpenses = (month) => {
    const data = loadData();
    const currentYear = new Date().getFullYear();
    const filteredExpenses = month ? 
        data.filter(expense => new Date(expense.date).getMonth() + 1 === month && new Date(expense.date).getFullYear() === currentYear) :
        data;
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2);
    if (month) {
        console.log(`Total expenses for month ${month}: ${total}`);
    } else {
        console.log(`Total expenses: ${total}`);
    }
};

function exportToCSV() {
    const data = loadData();
    const csvLines = [];
    
    // Add CSV header
    csvLines.push('ID,Date,Category,Description,Amount');
    // Add each expense as a CSV line
    data.forEach(expense => {
        const line = [
            expense.id,
            expense.date,
            expense.category,
            expense.description,
            expense.amount.toFixed(2)
        ].join(','); // Join the fields with commas
        csvLines.push(line);
    });
    // Create a CSV string
    const csvContent = csvLines.join('\n');
    // Define the output file path
    const outputFilePath = path.resolve(__dirname, 'expenses.csv');
    // Write the CSV content to a file
    fs.writeFileSync(outputFilePath, csvContent, 'utf8');
    console.log(`Expenses exported to ${outputFilePath}`);
}

const main = () => {
    const { command, options } = parseArgs();

      switch (command) {
        case 'add': {
          add_expense(options.description, options.amount, options.category);
          break;
        }

        case 'update': {
          update_expense(options.id, options.description, options.amount, options.category);
          break;
        }

        case 'delete': {
          delete_expense(options.id);
          break;
        }

        case 'list': {
          list_expense(options.category);
          break;
        }

        case 'summary': {
          if (options.month) {
            summaryExpenses(parseInt(options.month));
          } else {
            summaryExpenses();
          }
          break;
        }

        case 'export': {
            exportToCSV();
            break;
        }
      

        case 'help':
        case undefined: {
          printUsage();
          break;
        }

        default: {
          console.log(`Unknown command: ${command}`);
          printUsage();
          process.exit(1);
        }
      }
};

main();

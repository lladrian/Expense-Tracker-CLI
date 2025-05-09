# CLI Expense Tracker

A simple command-line expense tracker application to manage the user finances built using Node.js that uses a JSON file as a file-based database.

## Features

- Users can add an expense with a description and amount.
- Users can update an expense.
- Users can delete an expense.
- Users can view all expenses.
- Users can view a summary of all expenses.
- Users can view a summary of expenses for a specific month (of current year).

## Add-ons Features
- Add expense categories and allow users to filter expenses by category.
- Allow users to set a budget for each month and show a warning when the user exceeds the budget.
- Allow users to export expenses to a CSV file.

## Installation

1. Make sure you have [Node.js](https://nodejs.org) installed.

2. Clone or download this project.

3. To run use this command : "node cli_task_tracker.js list"
  - Usage: node cli_task_tracker.js [command] [options]
  - Commands:
     - **add <description> <amount> <category>**          Add a new item with description, amount and category.
     - **delete <id>**                                    Delete the item with the specified ID.
     - **update <id> <description> <amount> <category>**  Update the item with the specified ID.
     - **list**                                           List all items.
     - **list <category>**                                List items that are filtered by the category.
     - **summary**                                        Summary of all expenses.
     - **summary <month>**                                Summary of all expenses for a specific month (of current year).
     - **export**                                         Export expenses to a CSV file.
     - **help**                                           Show this help message.


4. https://roadmap.sh/projects/expense-tracker

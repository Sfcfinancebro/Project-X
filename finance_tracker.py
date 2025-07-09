# -*- coding: utf-8 -*-
import json
import os
from datetime import datetime, date, timedelta
from typing import List, Dict, Any

class FinanceTracker:
    def __init__(self, data_file="finance_data.json"):
        self.data_file = data_file
        self.transactions = self.load_data()
        self.categories = {
            "income": ["Salary", "Freelance", "Investment", "Gift", "Refund", "Other"],
            "expense": ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare", "Education", "Refund", "Other"]
        }
        self.budgets = self.load_budgets()

    def load_data(self) -> List[Dict[str, Any]]:
        """Load transactions from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                print("⚠️  Warning: Could not load existing data. Starting fresh.")
                return []
        return []

    def save_data(self):
        """Save transactions to JSON file"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.transactions, f, indent=2, default=str)
            print("✅ Data saved successfully!")
        except Exception as e:
            print(f"❌ Error saving data: {e}")

    def load_budgets(self) -> Dict[str, float]:
        """Load budget data"""
        budget_file = "budgets.json"
        if os.path.exists(budget_file):
            try:
                with open(budget_file, 'r', encoding='utf-8') as f:
                    budgets = json.load(f)
                    print(f"✅ Loaded {len(budgets)} budget(s)")
                    return budgets
            except (json.JSONDecodeError, FileNotFoundError):
                print("⚠️  Warning: Could not load existing budgets. Starting fresh.")
                return {}
        return {}

    def save_budgets(self):
        """Save budget data"""
        try:
            with open("budgets.json", 'w', encoding='utf-8') as f:
                json.dump(self.budgets, f, indent=2)
            print("✅ Budgets saved successfully!")
        except Exception as e:
            print(f"❌ Error saving budgets: {e}")

    def display_welcome(self):
        """Display welcome message"""
        print("=" * 60)
        print("💰 ADVANCED FINANCE TRACKER 💰")
        print("=" * 60)
        print("Track your income, expenses, and financial goals!")
        print("Your data is automatically saved for your convenience.")
        print("💡 Tip: You can enter negative amounts for refunds/adjustments!")
        print()

    def show_menu(self):
        """Display main menu"""
        print("\n📋 MAIN MENU")
        print("-" * 30)
        print("1. 💰 Add Income")
        print("2. 💸 Add Expense")
        print("3. 📊 View Transaction History")
        print("4. 📈 Financial Summary")
        print("5. 🔍 Advanced Analytics")
        print("6. 🎯 Budget Management")
        print("7. 📤 Export Data")
        print("8. 🔎 Search Transactions")
        print("9. 🗑️  Delete Transaction")
        print("10. 🚪 Exit")
        print("-" * 30)

    def get_valid_amount(self, prompt: str, allow_negative: bool = True) -> float:
        """Get valid amount from user with improved validation"""
        while True:
            try:
                user_input = input(prompt).strip()
                
                # Handle empty input
                if not user_input:
                    print("❌ Amount cannot be empty. Please try again.")
                    continue
                
                amount = float(user_input)
                
                # Check for zero
                if amount == 0:
                    print("❌ Amount cannot be zero. Please enter a valid amount.")
                    continue
                
                # Check for negative amounts
                if not allow_negative and amount < 0:
                    print("❌ Negative amounts are not allowed for this transaction type.")
                    print("💡 Use the expense option for refunds/adjustments.")
                    continue
                
                return amount
            except ValueError:
                print("❌ Invalid amount. Please enter a valid number (e.g., 100.50 or -25.00).")

    def select_category(self, transaction_type: str) -> str:
        """Let user select from predefined categories or enter custom"""
        categories = self.categories[transaction_type]
        print(f"\n📂 Available {transaction_type} categories:")
        for i, category in enumerate(categories, 1):
            print(f"  {i}. {category}")
        print(f"  {len(categories) + 1}. ✏️  Custom category")
        
        while True:
            try:
                choice = input(f"Select category (1-{len(categories) + 1}): ").strip()
                
                if not choice:
                    print("❌ Please enter a valid choice.")
                    continue
                
                choice_num = int(choice)
                if 1 <= choice_num <= len(categories):
                    selected = categories[choice_num - 1]
                    print(f"✅ Selected: {selected}")
                    return selected
                elif choice_num == len(categories) + 1:
                    custom = input("Enter custom category: ").strip()
                    if custom:
                        print(f"✅ Custom category: {custom}")
                        return custom
                    else:
                        print("❌ Custom category cannot be empty.")
                else:
                    print(f"❌ Invalid choice. Please enter a number between 1 and {len(categories) + 1}.")
            except ValueError:
                print("❌ Please enter a valid number.")

    def add_income(self):
        """Add income transaction with improved validation"""
        print("\n💰 ADD INCOME")
        print("-" * 20)
        
        amount = self.get_valid_amount("Enter amount: $", allow_negative=True)
        source = input("Enter source: ").strip()
        if not source:
            source = "Unknown"
        
        category = self.select_category("income")
        description = input("Enter description (optional): ").strip()
        
        # Generate unique ID
        new_id = max([t["id"] for t in self.transactions], default=0) + 1
        
        transaction = {
            "id": new_id,
            "amount": amount,
            "type": "income",
            "category": category,
            "source": source,
            "description": description,
            "date": datetime.now().isoformat()
        }
        
        self.transactions.append(transaction)
        self.save_data()
        
        if amount < 0:
            print(f"✅ Refund/Adjustment of ${abs(amount):.2f} from {source} added successfully!")
        else:
            print(f"✅ Income of ${amount:.2f} from {source} added successfully!")

    def add_expense(self):
        """Add expense transaction with improved validation"""
        print("\n💸 ADD EXPENSE")
        print("-" * 20)
        
        amount = self.get_valid_amount("Enter amount: $", allow_negative=True)
        category = self.select_category("expense")
        description = input("Enter description (optional): ").strip()
        
        # Generate unique ID
        new_id = max([t["id"] for t in self.transactions], default=0) + 1
        
        transaction = {
            "id": new_id,
            "amount": amount,
            "type": "expense",
            "category": category,
            "description": description,
            "date": datetime.now().isoformat()
        }
        
        self.transactions.append(transaction)
        self.save_data()
        
        if amount < 0:
            print(f"✅ Refund/Adjustment of ${abs(amount):.2f} in {category} added successfully!")
        else:
            print(f"✅ Expense of ${amount:.2f} in {category} added successfully!")
        
        # Check budget alerts
        self.check_budget_alerts(category, amount)

    def check_budget_alerts(self, category: str, amount: float):
        """Check if expense exceeds budget with improved feedback"""
        if category in self.budgets:
            monthly_expenses = self.get_monthly_expenses_by_category(category)
            budget = self.budgets[category]
            
            if monthly_expenses > budget:
                print(f"⚠️  BUDGET ALERT: You've exceeded your {category} budget!")
                print(f"   📊 Budget: ${budget:.2f}")
                print(f"   💸 Spent: ${monthly_expenses:.2f}")
                print(f"   ❌ Over by: ${monthly_expenses - budget:.2f}")
            elif monthly_expenses > budget * 0.8:  # 80% warning
                remaining = budget - monthly_expenses
                print(f"⚠️  BUDGET WARNING: You've used {(monthly_expenses/budget)*100:.1f}% of your {category} budget")
                print(f"   💰 Remaining: ${remaining:.2f}")

    def view_history(self):
        """View transaction history with improved filtering and display"""
        if not self.transactions:
            print("📭 No transactions found.")
            return
        
        print("\n📊 TRANSACTION HISTORY")
        print("-" * 50)
        
        # Filter options
        print("🔍 Filter options:")
        print("1. 📋 All transactions")
        print("2. 💰 Income only")
        print("3. 💸 Expenses only")
        print("4. 🏷️  By category")
        print("5. 📅 This month")
        print("6. 📅 Last 30 days")
        
        choice = input("Select filter (1-6): ").strip()
        
        filtered_transactions = self.transactions.copy()
        
        if choice == "2":
            filtered_transactions = [t for t in self.transactions if t["type"] == "income"]
        elif choice == "3":
            filtered_transactions = [t for t in self.transactions if t["type"] == "expense"]
        elif choice == "4":
            category = input("Enter category name: ").strip()
            filtered_transactions = [t for t in self.transactions if t["category"].lower() == category.lower()]
        elif choice == "5":
            current_month = datetime.now().month
            current_year = datetime.now().year
            filtered_transactions = [t for t in self.transactions 
                                   if datetime.fromisoformat(t["date"]).month == current_month and
                                   datetime.fromisoformat(t["date"]).year == current_year]
        elif choice == "6":
            thirty_days_ago = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30)
            filtered_transactions = [t for t in self.transactions 
                                   if datetime.fromisoformat(t["date"]) >= thirty_days_ago]
        
        if not filtered_transactions:
            print("📭 No transactions match your filter.")
            return
        
        # Sort by date (newest first)
        filtered_transactions.sort(key=lambda x: x["date"], reverse=True)
        
        print(f"\n📋 Showing {len(filtered_transactions)} transaction(s):")
        print("-" * 90)
        print(f"{'ID':<4} {'Date':<16} {'Type':<8} {'Amount':<12} {'Category':<15} {'Description':<25}")
        print("-" * 90)
        
        for transaction in filtered_transactions:
            date_str = datetime.fromisoformat(transaction["date"]).strftime("%Y-%m-%d %H:%M")
            amount = transaction["amount"]
            t_type = transaction["type"].upper()
            category = transaction["category"]
            description = transaction.get("description", "")[:23]
            
            # Add color indicators for amount
            amount_str = f"${amount:<11.2f}"
            if amount < 0:
                amount_str = f"🔴{amount_str}"  # Red for negative
            elif t_type == "INCOME":
                amount_str = f"🟢{amount_str}"  # Green for income
            else:
                amount_str = f"🟡{amount_str}"  # Yellow for expenses
            
            print(f"{transaction['id']:<4} {date_str:<16} {t_type:<8} {amount_str:<12} {category:<15} {description:<25}")

    def view_summary(self):
        """Display financial summary with improved formatting"""
        if not self.transactions:
            print("📭 No transactions found.")
            return
        
        print("\n📈 FINANCIAL SUMMARY")
        print("-" * 40)
        
        # Calculate totals
        total_income = sum(t["amount"] for t in self.transactions if t["type"] == "income")
        total_expenses = sum(t["amount"] for t in self.transactions if t["type"] == "expense")
        net_balance = total_income - total_expenses
        
        # Current month calculations
        current_month = datetime.now().month
        current_year = datetime.now().year
        monthly_income = sum(t["amount"] for t in self.transactions 
                           if t["type"] == "income" and 
                           datetime.fromisoformat(t["date"]).month == current_month and
                           datetime.fromisoformat(t["date"]).year == current_year)
        monthly_expenses = sum(t["amount"] for t in self.transactions 
                             if t["type"] == "expense" and 
                             datetime.fromisoformat(t["date"]).month == current_month and
                             datetime.fromisoformat(t["date"]).year == current_year)
        monthly_balance = monthly_income - monthly_expenses
        
        # Savings rate
        savings_rate = (monthly_balance / monthly_income * 100) if monthly_income > 0 else 0
        
        print(f"💰 Total Income:     ${total_income:,.2f}")
        print(f"💸 Total Expenses:   ${total_expenses:,.2f}")
        print(f"💳 Net Balance:      ${net_balance:,.2f}")
        print()
        print(f"📅 This Month:")
        print(f"  💰 Income:         ${monthly_income:,.2f}")
        print(f"  💸 Expenses:       ${monthly_expenses:,.2f}")
        print(f"  💳 Balance:        ${monthly_balance:,.2f}")
        print(f"  📊 Savings Rate:   {savings_rate:.1f}%")
        
        # Add budget summary
        if self.budgets:
            print(f"\n🎯 Budget Summary:")
            for category, budget in self.budgets.items():
                spent = self.get_monthly_expenses_by_category(category)
                remaining = budget - spent
                percentage = (spent / budget * 100) if budget > 0 else 0
                status = "✅" if remaining >= 0 else "❌"
                print(f"  {category}: ${spent:.2f}/${budget:.2f} ({percentage:.1f}%) {status}")

    def advanced_analytics(self):
        """Display advanced analytics with improved formatting"""
        if not self.transactions:
            print("📭 No transactions found.")
            return
        
        print("\n🔍 ADVANCED ANALYTICS")
        print("-" * 40)
        
        # Category breakdown
        print("\n📊 EXPENSE CATEGORY BREAKDOWN:")
        expense_categories = {}
        total_expenses = 0
        
        for transaction in self.transactions:
            if transaction["type"] == "expense":
                category = transaction["category"]
                amount = transaction["amount"]
                expense_categories[category] = expense_categories.get(category, 0) + amount
                total_expenses += amount
        
        if expense_categories:
            for category, amount in sorted(expense_categories.items(), key=lambda x: x[1], reverse=True):
                percentage = (amount / total_expenses * 100) if total_expenses > 0 else 0
                print(f"  {category:<15} ${amount:>8,.2f} ({percentage:>5.1f}%)")
        
        # Income source analysis
        print("\n💰 INCOME SOURCE ANALYSIS:")
        income_sources = {}
        total_income = 0
        
        for transaction in self.transactions:
            if transaction["type"] == "income":
                source = transaction.get("source", "Unknown")
                amount = transaction["amount"]
                income_sources[source] = income_sources.get(source, 0) + amount
                total_income += amount
        
        if income_sources:
            for source, amount in sorted(income_sources.items(), key=lambda x: x[1], reverse=True):
                percentage = (amount / total_income * 100) if total_income > 0 else 0
                print(f"  {source:<15} ${amount:>8,.2f} ({percentage:>5.1f}%)")
        
        # Monthly trends (last 6 months)
        print("\n📈 MONTHLY TRENDS (Last 6 months):")
        monthly_data = {}
        
        for transaction in self.transactions:
            date_obj = datetime.fromisoformat(transaction["date"])
            month_key = f"{date_obj.year}-{date_obj.month:02d}"
            
            if month_key not in monthly_data:
                monthly_data[month_key] = {"income": 0, "expenses": 0}
            
            if transaction["type"] == "income":
                monthly_data[month_key]["income"] += transaction["amount"]
            else:
                monthly_data[month_key]["expenses"] += transaction["amount"]
        
        # Sort by month and show last 6
        sorted_months = sorted(monthly_data.keys())[-6:]
        
        for month in sorted_months:
            income = monthly_data[month]["income"]
            expenses = monthly_data[month]["expenses"]
            balance = income - expenses
            print(f"  {month}: 💰${income:>8,.2f} | 💸${expenses:>8,.2f} | 💳${balance:>8,.2f}")

    def budget_management(self):
        """Manage budgets with improved persistence and feedback"""
        while True:
            print("\n🎯 BUDGET MANAGEMENT")
            print("-" * 30)
            print("1. 📝 Set budget")
            print("2. 👀 View budgets")
            print("3. 🗑️  Delete budget")
            print("4. 📊 Budget vs Actual")
            print("5. 🔙 Back to main menu")
            
            choice = input("Select option (1-5): ").strip()
            
            if choice == "1":
                category = input("Enter category name: ").strip()
                if not category:
                    print("❌ Category name cannot be empty.")
                    continue
                
                amount = self.get_valid_amount("Enter monthly budget amount: $", allow_negative=False)
                self.budgets[category] = amount
                self.save_budgets()
                print(f"✅ Budget set for {category}: ${amount:.2f}")
            
            elif choice == "2":
                if not self.budgets:
                    print("📭 No budgets set.")
                else:
                    print(f"\n📋 CURRENT BUDGETS ({len(self.budgets)} total):")
                    for category, budget in self.budgets.items():
                        spent = self.get_monthly_expenses_by_category(category)
                        remaining = budget - spent
                        percentage = (spent / budget * 100) if budget > 0 else 0
                        status = "✅ OK" if remaining >= 0 else "❌ EXCEEDED"
                        print(f"   {category}: ${spent:.2f}/${budget:.2f} ({percentage:.1f}%) - {status}")
            
            elif choice == "3":
                if not self.budgets:
                    print("📭 No budgets to delete.")
                else:
                    print("📋 Current budgets:")
                    for i, category in enumerate(self.budgets.keys(), 1):
                        print(f"{i}. {category}")
                    try:
                        idx = int(input("Enter budget number to delete: ")) - 1
                        category = list(self.budgets.keys())[idx]
                        confirm = input(f"Are you sure you want to delete the budget for {category}? (y/n): ").strip().lower()
                        if confirm == 'y':
                            del self.budgets[category]
                            self.save_budgets()
                            print(f"✅ Budget for {category} deleted.")
                        else:
                            print("❌ Deletion cancelled.")
                    except (ValueError, IndexError):
                        print("❌ Invalid selection.")
            
            elif choice == "4":
                if not self.budgets:
                    print("📭 No budgets set.")
                else:
                    print("\n📊 BUDGET VS ACTUAL ANALYSIS:")
                    for category, budget in self.budgets.items():
                        spent = self.get_monthly_expenses_by_category(category)
                        remaining = budget - spent
                        percentage = (spent / budget * 100) if budget > 0 else 0
                        
                        if percentage >= 100:
                            status = "❌ EXCEEDED"
                        elif percentage >= 80:
                            status = "⚠️  WARNING"
                        else:
                            status = "✅ GOOD"
                        
                        print(f"   {category}:")
                        print(f"     Budget: ${budget:.2f}")
                        print(f"     Spent:  ${spent:.2f}")
                        print(f"     Remaining: ${remaining:.2f}")
                        print(f"     Usage: {percentage:.1f}% {status}")
                        print()
            
            elif choice == "5":
                break

    def get_monthly_expenses_by_category(self, category: str) -> float:
        """Get monthly expenses for a specific category"""
        current_month = datetime.now().month
        current_year = datetime.now().year
        return sum(t["amount"] for t in self.transactions 
                  if t["type"] == "expense" and 
                  t["category"] == category and
                  datetime.fromisoformat(t["date"]).month == current_month and
                  datetime.fromisoformat(t["date"]).year == current_year)

    def export_data(self):
        """Export data to CSV format with improved error handling"""
        if not self.transactions:
            print("📭 No data to export.")
            return
        
        filename = f"finance_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("ID,Date,Type,Amount,Category,Description,Source\n")
                for transaction in self.transactions:
                    date_str = datetime.fromisoformat(transaction["date"]).strftime("%Y-%m-%d %H:%M")
                    amount = transaction["amount"]
                    t_type = transaction["type"]
                    category = transaction["category"]
                    description = transaction.get("description", "")
                    source = transaction.get("source", "")
                    
                    f.write(f"{transaction['id']},{date_str},{t_type},{amount},{category},{description},{source}\n")
            
            print(f"✅ Data exported to {filename}")
        except Exception as e:
            print(f"❌ Error exporting data: {e}")

    def search_transactions(self):
        """Search transactions by various criteria with improved feedback"""
        if not self.transactions:
            print("📭 No transactions to search.")
            return
        
        print("\n🔍 SEARCH TRANSACTIONS")
        print("-" * 30)
        print("1. 🔢 Search by amount range")
        print("2. 📅 Search by date range")
        print("3. 📝 Search by description")
        print("4. 🏷️  Search by category")
        
        choice = input("Select search type (1-4): ").strip()
        results = []
        
        if choice == "1":
            min_amount = self.get_valid_amount("Enter minimum amount: $", allow_negative=True)
            max_amount = self.get_valid_amount("Enter maximum amount: $", allow_negative=True)
            if min_amount > max_amount:
                min_amount, max_amount = max_amount, min_amount
            results = [t for t in self.transactions if min_amount <= t["amount"] <= max_amount]
        
        elif choice == "2":
            start_date = input("Enter start date (YYYY-MM-DD): ").strip()
            end_date = input("Enter end date (YYYY-MM-DD): ").strip()
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                results = [t for t in self.transactions 
                          if start <= datetime.fromisoformat(t["date"]) <= end]
            except ValueError:
                print("❌ Invalid date format. Please use YYYY-MM-DD.")
                return
        
        elif choice == "3":
            keyword = input("Enter search keyword: ").strip().lower()
            if keyword:
                results = [t for t in self.transactions 
                          if keyword in t.get("description", "").lower()]
            else:
                print("❌ Search keyword cannot be empty.")
                return
        
        elif choice == "4":
            category = input("Enter category name: ").strip()
            if category:
                results = [t for t in self.transactions 
                          if t["category"].lower() == category.lower()]
            else:
                print("❌ Category name cannot be empty.")
                return
        
        if not results:
            print("📭 No transactions found.")
            return
        
        print(f"\n🔍 Found {len(results)} transaction(s):")
        for transaction in results:
            date_str = datetime.fromisoformat(transaction["date"]).strftime("%Y-%m-%d %H:%M")
            amount = transaction["amount"]
            amount_str = f"${amount:.2f}"
            if amount < 0:
                amount_str = f"🔴{amount_str}"
            print(f"ID: {transaction['id']} | {date_str} | {transaction['type'].upper()} | {amount_str} | {transaction['category']}")

    def delete_transaction(self):
        """Delete a transaction by ID with improved confirmation"""
        if not self.transactions:
            print("📭 No transactions to delete.")
            return
        
        print("\n🗑️  DELETE TRANSACTION")
        print("-" * 30)
        
        # Show recent transactions
        recent_transactions = sorted(self.transactions, key=lambda x: x["date"], reverse=True)[:10]
        print("📋 Recent transactions:")
        for transaction in recent_transactions:
            date_str = datetime.fromisoformat(transaction["date"]).strftime("%Y-%m-%d %H:%M")
            amount = transaction["amount"]
            amount_str = f"${amount:.2f}"
            if amount < 0:
                amount_str = f"🔴{amount_str}"
            print(f"ID: {transaction['id']} | {date_str} | {transaction['type'].upper()} | {amount_str} | {transaction['category']}")
        
        try:
            transaction_id = int(input("\nEnter transaction ID to delete: "))
            transaction = next((t for t in self.transactions if t["id"] == transaction_id), None)
            
            if transaction:
                date_str = datetime.fromisoformat(transaction["date"]).strftime("%Y-%m-%d %H:%M")
                amount = transaction["amount"]
                amount_str = f"${amount:.2f}"
                if amount < 0:
                    amount_str = f"🔴{amount_str}"
                
                print(f"\n🗑️  Transaction to delete:")
                print(f"   ID: {transaction['id']}")
                print(f"   Date: {date_str}")
                print(f"   Type: {transaction['type'].upper()}")
                print(f"   Amount: {amount_str}")
                print(f"   Category: {transaction['category']}")
                print(f"   Description: {transaction.get('description', 'N/A')}")
                
                confirm = input(f"\nAre you sure you want to delete this transaction? (y/n): ").strip().lower()
                if confirm == 'y':
                    self.transactions.remove(transaction)
                    self.save_data()
                    print("✅ Transaction deleted successfully!")
                else:
                    print("❌ Deletion cancelled.")
            else:
                print("❌ Transaction not found.")
        except ValueError:
            print("❌ Invalid transaction ID.")

    def run(self):
        """Main application loop with improved error handling"""
        self.display_welcome()
        
        while True:
            try:
                self.show_menu()
                choice = input("Enter your choice (1-10): ").strip()
                
                if choice == "1":
                    self.add_income()
                elif choice == "2":
                    self.add_expense()
                elif choice == "3":
                    self.view_history()
                elif choice == "4":
                    self.view_summary()
                elif choice == "5":
                    self.advanced_analytics()
                elif choice == "6":
                    self.budget_management()
                elif choice == "7":
                    self.export_data()
                elif choice == "8":
                    self.search_transactions()
                elif choice == "9":
                    self.delete_transaction()
                elif choice == "10":
                    print("\n👋 Thank you for using the Advanced Finance Tracker!")
                    print("💾 Your data has been saved automatically.")
                    break
                else:
                    print("❌ Invalid choice. Please enter a number between 1 and 10.")
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye! Your data has been saved.")
                break
            except Exception as e:
                print(f"❌ An error occurred: {e}")
                print("🔄 Please try again.")

def main():
    """Main function to start the application"""
    try:
        tracker = FinanceTracker()
        tracker.run()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        print("🔄 Please restart the application.")

if __name__ == "__main__":
    main() 
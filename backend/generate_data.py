import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_restaurant_data(filename="restaurant_data.csv", num_tables=12):
    np.random.seed(42)
    random.seed(42)

    # Table data
    tables = [f"Table_{i+1}" for i in range(num_tables)]

    # Waiters
    waiters = ["Moshe", "Anna", "Omar", "Sarah", "David", "Yael"]

    # Generate some mock data for today
    today = datetime.now().date()

    data = []

    for table in tables:
        # Determine if table is occupied right now
        is_occupied = random.choice([True, False])

        # Simulated today's revenue for this table
        revenue_today = round(random.uniform(50, 800), 2)

        # Number of guests currently at the table (0 if not occupied)
        guests = random.randint(1, 6) if is_occupied else 0

        # Primary language of the current/last guests
        languages = ["Hebrew", "English", "Russian", "Arabic"]
        language = random.choice(languages)

        # Waiter assigned
        waiter = random.choice(waiters)

        data.append({
            "table_id": table,
            "is_occupied": is_occupied,
            "guests_count": guests,
            "revenue_today_ils": revenue_today,
            "primary_language": language,
            "assigned_waiter": waiter
        })

    df = pd.DataFrame(data)

    # Add coordinates for the 3D grid layout
    # Assuming a 3x4 grid
    grid_x = []
    grid_z = []

    cols = 4
    for i in range(num_tables):
        row = i // cols
        col = i % cols
        # Space them out by 3 units
        grid_x.append((col - cols/2) * 3 + 1.5)
        grid_z.append((row - (num_tables/cols)/2) * 3 + 1.5)

    df['pos_x'] = grid_x
    df['pos_z'] = grid_z

    df.to_csv(filename, index=False)
    print(f"Successfully generated mock data: {filename}")

if __name__ == "__main__":
    generate_restaurant_data("backend/restaurant_data.csv")

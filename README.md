# ClickHouse Message Analytics Tracker

This project demonstrates how to use ClickHouse to track and analyze messages sent for messaging platforms.

## Description

This is a demo application that showcases how you can leverage ClickHouse, a fast open-source column-oriented database management system, to store and analyze large volumes of messaging data.

## Prerequisites

- ClickUp account
- NodeJS

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/clickhouse-message-analytics-tracker.git
   cd clickhouse-message-analytics-tracker
   ```
2. Install dependencies: 
    ```
    yarn
    ```
3. Create a `.env` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_CLICKHOUSE_HOST=
   NEXT_PUBLIC_CLICKHOUSE_USERNAME=
   NEXT_PUBLIC_CLICKHOUSE_PASSWORD=
   ```

## Running the Application

1. Run the webapp
   ```
    yarn dev
   ```
# Nardaa - Developer-First Transactional Email Service

Nardaa is a transactional email service designed for developers to eliminate the friction of sending emails from `localhost` and managing templates.

## 🚀 Features

-   **Developer-First API**: Simple SDK to trigger emails.
-   **Sandbox Mode**: "Trap" emails sent from localhost without spamming real users.
-   **Dynamic Templates**: Manage templates with a visual editor (Handlebars support).
-   **Microservices Architecture**: Scalable, decoupled services managed via Docker.
-   **Real-time Logs**: Instant visibility into email delivery status.

## 🏗 System Architecture

The system is built as a set of Microservices orchestrated by Docker Compose:

1.  **NGINX / Edge Layer**: Routes traffic to the API Gateway.
2.  **API Gateway**: Handles Authentication, Rate Limiting, and Routing.
3.  **Project Service**: Manages Projects and API Keys.
4.  **Template Service**: Manages Email Templates (CRUD).
5.  **Email Service**: Validates requests and queues email jobs (Producer).
6.  **Worker Service**: Consumes jobs from RabbitMQ and handles delivery.

### Technology Stack
-   **Backend**: Node.js, Express, Handlebars
-   **Infrastructure**: Docker, NGINX
-   **Queue**: RabbitMQ (Topic Exchange, DLQ, Retry)
-   **Database**: Firebase Firestore
-   **Auth**: Firebase Auth & API Keys

## 🛠 Getting Started

### Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose
-   Firebase Project Credentials

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/nirmalkr01/nardaa.git
    cd nardaa
    ```

2.  **Run with Docker (Recommended)**:
    ```bash
    cd Backend
    docker-compose up --build
    ```
    The API will be available at `http://localhost/api/v1`.

### Local Development (Manual)

If you want to run services individually without Docker:

1.  **Install Dependencies**:
    ```bash
    cd Backend
    npm install
    ```

2.  **Environment Variables**:
    Create `Backend/.env`:
    ```env
    PORT=3000
    RABBITMQ_URL=amqp://localhost
    # FIREBASE_SERVICE_ACCOUNT=... (Optional for mock mode)
    ```

3.  **Start Services**:
    -   Gateway: `node services/gateway/server.js`
    -   Services: `node services/<service-name>/server.js`
    -   Worker: `node services/worker/index.js`

## 🧪 Testing

Run the smoke test script to verify the full flow:
```bash
cd Backend
# Test against Docker (Port 80)
USE_DOCKER=true node test_smoke.js

# Or test against local Gateway (Port 3000)
node test_smoke.js
```

## 📜 License

MIT

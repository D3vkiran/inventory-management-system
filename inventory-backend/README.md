# Inventory Backend

Spring Boot 3 backend foundation for the Inventory Management System.

## Requirements

- Java 21
- Maven 3.9+
- MySQL 8

## Configuration

Set these environment variables before running against MySQL:

```powershell
$env:MYSQL_URL="jdbc:mysql://localhost:3306/inventory_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:MYSQL_USER="your_mysql_user"
$env:MYSQL_PASSWORD="your_mysql_password"
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-bytes"
$env:OWNER_EMAIL="owner@inventory.local"
$env:OWNER_PASSWORD="ChangeMe123!"
$env:OWNER_NAME="Owner"
```

## Run

```powershell
mvn.cmd spring-boot:run
```

or:

```powershell
mvn.cmd -DskipTests package
java -jar target\inventory-backend-0.0.1-SNAPSHOT.jar
```

## Authentication

The backend seeds one Owner account when the configured email does not already exist.

Default development credentials:

- Email: `owner@inventory.local`
- Password: `ChangeMe123!`

## Endpoints

All endpoints return JSON. All endpoints except login require:

```http
Authorization: Bearer <token>
```

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### Inventory

- `GET /api/inventory`
- `GET /api/inventory?productId={productId}`
- `GET /api/inventory/{id}`
- `POST /api/inventory`
- `PUT /api/inventory/{id}`
- `DELETE /api/inventory/{id}`

### Foundation Read Endpoints

- `GET /api/suppliers`
- `GET /api/purchases`
- `GET /api/sales`
- `GET /api/shipments`

# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B


# ---- Stage 2: Run ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy only the built jar from stage 1
COPY --from=build /app/target/*.jar app.jar

# Non-root user (good practice)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 2022

ENTRYPOINT ["java", "-jar", "app.jar"]
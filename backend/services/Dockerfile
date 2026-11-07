# Todas las aplicaciones se compilan y se ejecutan con Java 25.
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
ARG SERVICE
COPY . .
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp -pl "$SERVICE" -am verify

FROM eclipse-temurin:25-jre
ARG SERVICE
WORKDIR /app
RUN mkdir -p /app/uploads && chown -R 10001:10001 /app
COPY --from=build /build/${SERVICE}/target/mm-${SERVICE}-3.0.0.jar /app/app.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=65","-jar","/app/app.jar"]

FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 9191

CMD ["java","-jar","target/email-writer-0.0.1-SNAPSHOT.jar"]
import "server-only";
import { Sequelize } from "sequelize";
import { getServerEnvironment } from "@/config/env";

let sequelize: Sequelize | undefined;

export function getDatabaseConnection(): Sequelize {
  if (sequelize) {
    return sequelize;
  }

  const environment = getServerEnvironment();

  sequelize = new Sequelize({
    dialect: "mysql",
    host: environment.DB_HOST,
    logging: false,
    database: environment.DB_NAME,
    username: environment.DB_USER,
    password: environment.DB_PASSWORD,
    port: environment.DB_PORT,
    dialectOptions: environment.DB_SSL === "true" ? { ssl: { require: true } } : undefined,
  });

  return sequelize;
}

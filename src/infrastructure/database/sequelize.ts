import "server-only";
import path from "node:path";
import { Sequelize } from "sequelize";

let sequelize: Sequelize | undefined;

export function getDatabaseConnection(): Sequelize {
  if (sequelize) {
    return sequelize;
  }

  sequelize = new Sequelize({
    dialect: "sqlite",
    logging: false,
    storage: path.join(process.cwd(), "data", "akbar-marine.sqlite"),
  });

  return sequelize;
}

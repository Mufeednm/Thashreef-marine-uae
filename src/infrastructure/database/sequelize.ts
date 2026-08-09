import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { Sequelize } from "sequelize";

let sequelize: Sequelize | undefined;

export function getDatabaseConnection(): Sequelize {
  if (sequelize) {
    return sequelize;
  }

  const databasePath = path.join(process.cwd(), "data", "akbar-marine.sqlite");
  mkdirSync(path.dirname(databasePath), { recursive: true });

  sequelize = new Sequelize({
    dialect: "sqlite",
    logging: false,
    storage: databasePath,
  });

  return sequelize;
}

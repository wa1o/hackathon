// prisma.config.ts
import { defineConfig } from 'prisma/config'
import 'dotenv/config' // <--- Importante para leer el .env

export default defineConfig({
  // Aquí defines la URL de tu base de datos, usando la variable de entorno
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  // Otras configuraciones opcionales pueden ir aquí
  // schema: './prisma/schema.prisma', // Por defecto ya busca aquí
})
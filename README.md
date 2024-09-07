# 🍪 @ent-cookies

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Deno JS](https://img.shields.io/badge/deno%20js-000000?style=for-the-badge&logo=deno&logoColor=white)

## About

This is a typescript library made to easily get cookies from your ENT (Espace Numérique de Travail) account.

This project is made using [Deno](https://deno.land/).

## Supported ENTs and services

| ENT                                                 | Service                   | id | 
|-----------------------------------------------------|---------------------------|-------|
| [Toutatice (Bretagne)](https://www.toutatice.fr/) | 🦋 Pronote, 📰 Europresse | toutatice |
| [Sciences Po Bordeaux](https://ent.sciencespobordeaux.fr)| 📰 Europresse | scpobx |

If you want to add support for another ENT, feel free to open a pull request.

## Usage

```ts
import { getCookie } from "https://deno.land/x/ent_cookies/mod.ts";

const cookiesData = await getCookie("username", "password", "ent", "service");
console.log(cookiesData);
```
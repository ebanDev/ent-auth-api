# 🍪 ENT Cookies API

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Febandev%2Fent-cookies-api)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Deno JS](https://img.shields.io/badge/deno%20js-000000?style=for-the-badge&logo=deno&logoColor=white)

## About

This is a typescript API made to easily get cookies from your ENT (Espace Numérique de Travail) account.

This project is made using [Deno](https://deno.land/) and is meant to be used as a [Vercel Edge Function](https://vercel.com/docs/functions/edge-functions).

Currently only supports the [ENT of Bretagne, Toutatice](https://www.toutatice.fr/).

If you want to add support for another ENT, feel free to open a pull request.

## Usage

To call the API, you need to make a GET request to the `/api/auth` endpoint with the following query parameters:

- `ent`: The name of the ENT. Currently, only 'toutatice' is supported.
- `username`: Your ENT username.
- `password`: Your ENT password.

Don't forget to URL encode the password if it contains special characters :) 

Here is an example of how to call the API using `curl`:

```bash
curl "https://ent-auth-api.vercel.app/api/auth?ent=toutatice&username=your_username&password=your_password"
```
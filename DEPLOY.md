# VPS Deployment

This setup runs the Bun app, SQLite database volume, and MinIO on one VPS. It expects your existing Traefik container to handle HTTPS.

## 1. Prepare DNS

Point both hosts to the VPS public IP:

- `APP_HOST`, for example `wishlist.example.com`
- `MINIO_HOST`, for example `s3.example.com`

## 2. Configure environment

Copy `.env.example` to `.env` on the VPS and replace every placeholder.

Set `TRAEFIK_NETWORK` to the Docker network used by your existing Traefik container. You can find it with:

```sh
docker inspect traefik --format '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```

Use strong values for:

- `ADMIN_TOKEN`
- `MINIO_ROOT_PASSWORD`
- `MINIO_SECRET_KEY`

## 3. Start infrastructure

```sh
docker compose up -d minio minio-init
```

This starts MinIO, creates the bucket, enables public reads for uploaded images, applies CORS, and creates the app MinIO user. HTTPS routing is handled by your existing Traefik container through Docker labels.

## 4. Restore the SQLite database

Start the app once so Docker creates the `app_data` volume, then stop it before copying the Railway database file:

```sh
docker compose up -d app
docker compose stop app
docker compose cp ./wishlist.db app:/app/data/wishlist.db
docker compose up -d app
```

The app stores production data at `/app/data/wishlist.db`, backed by the `app_data` Docker volume.

## 5. Verify

- Open `https://${APP_HOST}` and confirm the existing wishlist data appears.
- Open `https://${APP_HOST}/admin` and confirm `ADMIN_TOKEN` works.
- Upload a fallback image from admin and confirm it loads from `https://${MINIO_HOST}/${MINIO_BUCKET}/...`.

The MinIO console is intentionally not exposed through Traefik.

## GitHub Actions Deployment

The workflow in `.github/workflows/deploy.yml` runs CI on GitHub-hosted runners for pull requests and pushes to `main`.

Deployments run only after a successful push to `main`, on a self-hosted runner.

Install the runner on the VPS in the same directory as this repository checkout. Add a GitHub Actions secret named `ENV` containing the full production `.env` file content; the deploy workflow writes that secret to `.env` before running Docker Compose.

Recommended repository settings:

- protect `main`;
- require the CI job before merge;
- do not allow fork pull requests to use the self-hosted runner;
- require approval for the `production` environment if you want manual deployment approval.

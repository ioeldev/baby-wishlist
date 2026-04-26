# VPS Deployment

This setup runs the Bun app, SQLite database bind mount, and MinIO on one VPS. It expects your existing Traefik container to handle HTTPS.

## 1. Prepare DNS

Point both hosts to the VPS public IP:

- `APP_HOST`, for example `wishlist.example.com`
- `MINIO_HOST`, for example `s3.example.com`
- `MINIO_CONSOLE_HOST`, for example `minio.example.com`

## 2. Configure environment

Copy `.env.example` to `.env` on the VPS and replace every placeholder.

Set `TRAEFIK_NETWORK` to the Docker network used by your existing Traefik container. You can find it with:

```sh
docker inspect traefik --format '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```

Use strong values for:

- `ADMIN_TOKEN`
- `MINIO_ROOT_PASSWORD`
- `MINIO_SECRET_KEY`, at least 8 characters

## 3. Start infrastructure

```sh
docker compose up -d minio
```

This starts MinIO and exposes both the S3 API and the MinIO console through your existing Traefik container.

Open `https://${MINIO_CONSOLE_HOST}` with `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`, then configure:

- create the `MINIO_BUCKET` bucket;
- allow anonymous download/read for uploaded public images;
- create or confirm the app user matching `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`;
- grant that app user read/write access to the bucket;
- configure bucket CORS for `https://${APP_HOST}` with `GET`, `PUT`, and `HEAD`.

## 4. Restore the SQLite database

Copy the Railway database file into the stable deploy directory before or after deployment:

```sh
cd /home/seed/babywishlist
mkdir -p data
docker compose stop app
cp /path/to/wishlist.db ./data/wishlist.db
docker compose up -d app
```

The app stores production data at `/app/data/wishlist.db`, backed by `/home/seed/babywishlist/data/wishlist.db` on the VPS.

## 5. Verify

- Open `https://${APP_HOST}` and confirm the existing wishlist data appears.
- Open `https://${APP_HOST}/admin` and confirm `ADMIN_TOKEN` works.
- Open `https://${MINIO_CONSOLE_HOST}` and confirm the MinIO console works.
- Upload a fallback image from admin and confirm it loads from `https://${MINIO_HOST}/${MINIO_BUCKET}/...`.

## GitHub Actions Deployment

The workflow in `.github/workflows/deploy.yml` runs CI on GitHub-hosted runners for pull requests and pushes to `main`.

Deployments run only after a successful push to `main`, on a self-hosted runner.

Install the runner on the VPS and add a GitHub Actions secret named `ENV` containing the full production `.env` file content.

The deploy workflow copies each checked-out `main` revision into this stable VPS directory before running Docker Compose:

```sh
/home/seed/babywishlist
```

It writes the `ENV` secret to `/home/seed/babywishlist/.env`, then runs all `docker compose` commands from `/home/seed/babywishlist`.

Recommended repository settings:

- protect `main`;
- require the CI job before merge;
- do not allow fork pull requests to use the self-hosted runner;
- require approval for the `production` environment if you want manual deployment approval.

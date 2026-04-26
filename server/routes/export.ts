import type { FastifyInstance } from "fastify";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { requireAdmin } from "../auth";
import { db } from "../db";

const crcTable = new Uint32Array(256);
for (let i = 0; i < crcTable.length; i++) {
  let value = i;
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[i] = value >>> 0;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function createZip(filename: string, contents: Uint8Array) {
  const name = Buffer.from(filename);
  const data = Buffer.from(contents);
  const checksum = crc32(data);
  const { dosDate, dosTime } = dosDateTime(new Date());

  if (data.length > 0xffffffff || name.length > 0xffff) {
    throw new Error("Database export is too large for this zip writer");
  }

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8);
  localHeader.writeUInt16LE(dosTime, 10);
  localHeader.writeUInt16LE(dosDate, 12);
  localHeader.writeUInt32LE(checksum, 14);
  localHeader.writeUInt32LE(data.length, 18);
  localHeader.writeUInt32LE(data.length, 22);
  localHeader.writeUInt16LE(name.length, 26);
  localHeader.writeUInt16LE(0, 28);

  const centralDirectory = Buffer.alloc(46);
  centralDirectory.writeUInt32LE(0x02014b50, 0);
  centralDirectory.writeUInt16LE(20, 4);
  centralDirectory.writeUInt16LE(20, 6);
  centralDirectory.writeUInt16LE(0, 8);
  centralDirectory.writeUInt16LE(0, 10);
  centralDirectory.writeUInt16LE(dosTime, 12);
  centralDirectory.writeUInt16LE(dosDate, 14);
  centralDirectory.writeUInt32LE(checksum, 16);
  centralDirectory.writeUInt32LE(data.length, 20);
  centralDirectory.writeUInt32LE(data.length, 24);
  centralDirectory.writeUInt16LE(name.length, 28);
  centralDirectory.writeUInt16LE(0, 30);
  centralDirectory.writeUInt16LE(0, 32);
  centralDirectory.writeUInt16LE(0, 34);
  centralDirectory.writeUInt16LE(0, 36);
  centralDirectory.writeUInt32LE(0, 38);
  centralDirectory.writeUInt32LE(0, 42);

  const centralDirectoryOffset = localHeader.length + name.length + data.length;
  const centralDirectorySize = centralDirectory.length + name.length;

  const endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(1, 8);
  endOfCentralDirectory.writeUInt16LE(1, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectorySize, 12);
  endOfCentralDirectory.writeUInt32LE(centralDirectoryOffset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  return Buffer.concat([localHeader, name, data, centralDirectory, name, endOfCentralDirectory]);
}

export async function exportRoutes(app: FastifyInstance) {
  app.get("/admin/wishlist-db.zip", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "wishlist-export-"));
    const backupPath = path.join(tempDir, "wishlist.db");

    try {
      db.exec(`VACUUM INTO ${sqlString(backupPath)}`);
      const snapshot = new Uint8Array(await Bun.file(backupPath).arrayBuffer());
      const zip = createZip("wishlist.db", snapshot);

      return reply
        .header("content-type", "application/zip")
        .header("content-disposition", 'attachment; filename="wishlist-db.zip"')
        .header("cache-control", "no-store")
        .send(zip);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
}

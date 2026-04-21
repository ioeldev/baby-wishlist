import { ExternalLink, Gift, LinkIcon, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import type { Item } from "../types";
import { Badge, Button } from "./ui";

type Props = {
  item: Item;
  admin?: boolean;
  onOffer?: (item: Item) => void;
  onAddLink?: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onDeleteLink?: (id: number) => void;
  onClearReservation?: (item: Item) => void;
};

export function ItemCard({ item, admin = false, onOffer, onAddLink, onEdit, onDelete, onDeleteLink, onClearReservation }: Props) {
  return (
    <article className={`h-full min-w-0 rounded-lg border bg-white p-3 shadow-sm transition hover:border-slate-300 sm:p-4 ${item.is_reserved ? "border-emerald-200" : "border-slate-200"}`}>
      <div className="grid h-full min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3">
        <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.is_reserved ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          <Gift className="h-4 w-4" />
        </div>
        <div className="flex h-full min-w-0 flex-col">
          <div className="min-w-0">
            <div className="grid min-w-0 gap-2">
              <div className="min-w-0">
                <h3 className={`break-words font-semibold leading-snug ${item.is_reserved ? "text-slate-500" : "text-slate-950"}`}>{item.name}</h3>
                {item.note ? <p className="mt-1 text-sm text-slate-600">{item.note}</p> : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {item.is_reserved ? <Badge tone="sky">Réservé</Badge> : null}
              {admin && item.reserved_first_name && item.reserved_last_name ? (
                <Badge>{item.reserved_first_name} {item.reserved_last_name}</Badge>
              ) : null}
              {item.assigned_to ? <Badge tone="sky">{item.assigned_to}</Badge> : null}
              {item.price_estimate !== null ? <Badge>{item.price_estimate} €</Badge> : null}
            </div>
            {item.links.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {item.links.map(link => (
                  <div key={link.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-slate-200 p-2 sm:gap-3">
                    {link.image ? <img src={link.image} alt="" className="h-10 w-10 rounded object-cover" /> : null}
                    <a href={link.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 text-sm font-medium text-slate-800 hover:text-emerald-700">
                      <span className="block truncate">{link.title ?? link.shop_name ?? link.url}</span>
                      {link.shop_name ? <span className="block truncate text-xs font-normal text-slate-500">{link.shop_name}</span> : null}
                    </a>
                    <div className="flex shrink-0 items-center gap-1">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                      {admin && onDeleteLink ? (
                        <Button variant="ghost" size="icon" onClick={() => onDeleteLink(link.id)} className="h-7 w-7 text-slate-400" aria-label="Supprimer le lien">
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-auto grid grid-cols-1 gap-2 pt-4 sm:flex sm:flex-wrap">
            {!admin && !item.is_reserved && onOffer ? (
              <Button variant="primary" size="sm" onClick={() => onOffer(item)} icon={<Gift className="h-4 w-4" />} className="w-full sm:w-auto">
                Offrir
              </Button>
            ) : null}
            {!admin && item.is_reserved ? <Button size="sm" disabled className="w-full sm:w-auto">Déjà réservé</Button> : null}
            {admin && onAddLink ? (
              <Button size="sm" onClick={() => onAddLink(item)} icon={<LinkIcon className="h-4 w-4" />} className="w-full sm:w-auto">
                Lien
              </Button>
            ) : null}
            {admin && onEdit ? (
              <Button size="sm" onClick={() => onEdit(item)} icon={<Pencil className="h-4 w-4" />} className="w-full sm:w-auto">
                Modifier
              </Button>
            ) : null}
            {admin && item.is_reserved && onClearReservation ? (
              <Button size="sm" onClick={() => onClearReservation(item)} icon={<RotateCcw className="h-4 w-4" />} className="w-full sm:w-auto">
                Libérer
              </Button>
            ) : null}
            {admin && onDelete ? (
              <Button variant="danger" size="sm" onClick={() => onDelete(item)} icon={<Trash2 className="h-4 w-4" />} className="w-full sm:w-auto">
                Supprimer
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

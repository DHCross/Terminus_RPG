import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ORDERS_LIST, type OrderInfo } from '../../../data/terminus/orders';

export function OrdersView() {
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo>(ORDERS_LIST[0]);
  const [query, setQuery] = useState('');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ORDERS_LIST;

    return ORDERS_LIST.filter((order) => {
      const searchable = [
        order.name,
        order.fieldFunction,
        ...order.approaches,
        ...order.signatures,
        ...order.abilities.map((ability) => `${ability.name} ${ability.description}`),
      ].join(' ').toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <div className="reference-layout">
      <aside>
        <div className="page-header">
          <h2>The Orders</h2>
          <p>Social powers, field roles, and play identities for rupture response.</p>
        </div>
        <label className="chip" htmlFor="orders-search">
          <Search size={15} /> Search Orders
        </label>
        <input
          id="orders-search"
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Breaker, Trace, debt..."
        />
        <div className="reference-list">
          {filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={selectedOrder.id === order.id ? 'reference-button active' : 'reference-button'}
            >
              <h3>{order.name}</h3>
              <small>{order.fieldFunction}</small>
            </button>
          ))}
        </div>
        {filteredOrders.length === 0 && (
          <div className="empty-state">No Orders match this search.</div>
        )}
      </aside>

      <section className="reference-detail">
        <span className="eyebrow">Order Record</span>
        <h2 style={{ margin: '0.35rem 0 0.4rem', color: 'var(--color-primary)', fontSize: '2rem' }}>
          {selectedOrder.name}
        </h2>
        <p className="muted" style={{ marginTop: 0, fontStyle: 'italic' }}>
          {selectedOrder.fieldFunction}
        </p>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', margin: '1.5rem 0' }}>
          <div>
            <h4>Approaches</h4>
            <div className="chip-row">
              {selectedOrder.approaches.map((approach) => (
                <span className="chip" key={approach}>{approach}</span>
              ))}
            </div>
          </div>
          <div>
            <h4>Signatures</h4>
            <div className="chip-row">
              {selectedOrder.signatures.map((signature) => (
                <span className="chip" key={signature}>{signature}</span>
              ))}
            </div>
          </div>
        </div>

        <h4>Starter Abilities</h4>
        {selectedOrder.abilities.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
            {selectedOrder.abilities.map((ability) => (
              <article className="panel" key={ability.name} style={{ background: 'var(--color-background)' }}>
                <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem' }}>
                  {ability.name}
                </strong>
                <span className="muted">{ability.description}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">Pending alpha text...</p>
        )}
      </section>
    </div>
  );
}

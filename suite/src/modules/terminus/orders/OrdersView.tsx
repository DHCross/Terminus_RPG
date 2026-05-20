import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { ORDERS_LIST, type OrderInfo } from '../../../data/terminus/orders';
import { RuleLink } from '../rules/RuleLink';

const HOOK_STYLES: Record<string, { label: string; color: string }> = {
  ground:  { label: 'Ground',  color: '#64748b' },
  will:    { label: 'Will',    color: '#991b1b' },
  shift:   { label: 'Shift',   color: '#92400e' },
  drift:   { label: 'Drift',   color: '#1e40af' },
  latent:  { label: 'Latent',  color: '#5b21b6' },
};

export function OrdersView() {
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo>(ORDERS_LIST[0]);
  const [query, setQuery] = useState('');
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ORDERS_LIST;

    return ORDERS_LIST.filter((order) => {
      const searchable = [
        order.name,
        order.fieldFunction,
        ...order.approaches,
        ...order.signatures,
        ...order.abilities.map((a) => `${a.name} ${a.shortText} ${a.trigger ?? ''} ${a.baseEffect ? `[${a.baseEffect.type}] ${a.baseEffect.text}` : ''}`),
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
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            <RuleLink section="orders" block />
          </p>
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
              onClick={() => { setSelectedOrder(order); setExpandedAbility(null); }}
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
          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
            {selectedOrder.abilities.map((ability) => {
              const isOpen = expandedAbility === ability.name;
              return (
                <article
                  key={ability.name}
                  className="panel"
                  style={{ background: 'var(--color-background)', padding: 0, overflow: 'hidden' }}
                >
                  {/* Header row — always visible */}
                  <button
                    onClick={() => setExpandedAbility(isOpen ? null : ability.name)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.2rem' }}>
                        {ability.name}
                      </strong>
                      <span className="muted" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {ability.shortText}
                      </span>
                      {ability.sceneHooks && ability.sceneHooks.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.45rem' }}>
                          {ability.sceneHooks.map((hook) => (
                            <span key={hook} style={{
                              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em',
                              textTransform: 'uppercase', padding: '0.1rem 0.4rem',
                              border: `1px solid ${HOOK_STYLES[hook]?.color ?? '#475569'}`,
                              color: HOOK_STYLES[hook]?.color ?? '#475569',
                              borderRadius: '2px',
                            }}>
                              {HOOK_STYLES[hook]?.label ?? hook}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span style={{ color: 'var(--color-muted)', flexShrink: 0, marginTop: '2px' }}>
                      {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (ability.trigger || ability.baseEffect || ability.exertEffect) && (
                    <div style={{
                      borderTop: '1px solid var(--color-border)',
                      padding: '0.75rem 1rem',
                      display: 'grid', gap: '0.65rem',
                    }}>
                      {ability.trigger && (
                        <div>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', margin: '0 0 0.25rem' }}>Trigger</p>
                          <p className="muted" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{ability.trigger}</p>
                        </div>
                      )}
                      {ability.baseEffect && (
                        <div>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', margin: '0 0 0.25rem' }}>
                            Base Effect ({ability.baseEffect.type})
                          </p>
                          <p className="muted" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{ability.baseEffect.text}</p>
                        </div>
                      )}
                      {ability.exertEffect && (
                        <div style={{
                          background: 'var(--color-surface)', borderRadius: '3px',
                          padding: '0.5rem 0.65rem', borderLeft: '2px solid var(--color-primary)',
                        }}>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', margin: '0 0 0.25rem' }}>
                            Exert Effect ({ability.exertEffect.type})
                          </p>
                          <p className="muted" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{ability.exertEffect.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">Pending alpha text...</p>
        )}
      </section>
    </div>
  );
}

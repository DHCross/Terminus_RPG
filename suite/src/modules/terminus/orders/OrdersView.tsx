import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ORDER_DOCTRINE,
  ORDER_STARTER_PICK,
  ORDERS_LIST,
  type OrderAbility,
  type OrderInfo,
} from '../../../data/terminus/orders';
import { findSignature } from '../../../data/terminus/signatures';
import { RuleLink } from '../rules/RuleLink';

const HOOK_STYLES: Record<string, { label: string; color: string }> = {
  ground: { label: 'Ground', color: '#64748b' },
  will: { label: 'Will', color: '#991b1b' },
  shift: { label: 'Shift', color: '#92400e' },
  drift: { label: 'Drift', color: '#1e40af' },
  latent: { label: 'Latent', color: '#5b21b6' },
};

function abilitySearchText(ability: OrderAbility): string {
  const upgrades = (ability.workingUpgrades ?? [])
    .map((upgrade) => `${upgrade.verb ?? ''} ${upgrade.text}`)
    .join(' ');
  return `${ability.name} ${ability.shortText} ${ability.standingPermission} ${upgrades} ${ability.tableTip ?? ''}`;
}

function AbilityCard({
  ability,
  isOpen,
  onToggle,
}: {
  ability: OrderAbility;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="panel" style={{ background: 'var(--color-background)', padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '0.75rem',
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
                <span
                  key={hook}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    padding: '0.1rem 0.4rem',
                    border: `1px solid ${HOOK_STYLES[hook]?.color ?? '#475569'}`,
                    color: HOOK_STYLES[hook]?.color ?? '#475569',
                    borderRadius: '2px',
                  }}
                >
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

      {isOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '0.75rem 1rem',
            display: 'grid',
            gap: '0.65rem',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-muted)',
                margin: '0 0 0.25rem',
              }}
            >
              Standing permission — free
            </p>
            {ability.standingPermission.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="muted" style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {paragraph}
              </p>
            ))}
          </div>

          {(ability.workingUpgrades ?? []).map((upgrade) => (
            <div
              key={upgrade.text}
              style={{
                background: 'var(--color-surface)',
                borderRadius: '3px',
                padding: '0.5rem 0.65rem',
                borderLeft: '2px solid var(--color-primary)',
              }}
            >
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-primary)',
                  margin: '0 0 0.25rem',
                }}
              >
                Working upgrade · {upgrade.cost}
                {upgrade.verb ? ` · ${upgrade.verb}` : ''}
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
                {upgrade.text}
              </p>
            </div>
          ))}

          {ability.tableTip && (
            <div>
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-muted)',
                  margin: '0 0 0.25rem',
                }}
              >
                At the table
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
                {ability.tableTip}
              </p>
            </div>
          )}

          {ability.guideNote && (
            <p className="muted" style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.5 }}>
              Guide only. {ability.guideNote}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

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
        order.identity,
        order.notThis,
        ...order.howToPlay,
        ...order.approaches,
        ...order.signatures,
        ...order.signatures.map((name) => {
          const signature = findSignature(name);
          return signature ? `${signature.property} ${signature.cost} ${signature.text}` : name;
        }),
        ...order.abilities.map(abilitySearchText),
        ...(order.laterAbilities ?? []).map(abilitySearchText),
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <div className="reference-layout">
      <aside>
        <div className="page-header">
          <h2>The Six Orders</h2>
          <p>Licensed field identities. Not jobs. Not classes.</p>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            <RuleLink section="orders" />
            {' · '}
            <RuleLink section="signatures" />
            {' · '}
            <RuleLink section="conflict" label="Core Exchange" />
            {' · '}
            <RuleLink section="magic-modes" label="Workings" />
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
              type="button"
              onClick={() => {
                setSelectedOrder(order);
                setExpandedAbility(null);
              }}
              className={selectedOrder.id === order.id ? 'reference-button active' : 'reference-button'}
            >
              <h3>{order.name}</h3>
              <small>{order.fieldFunction}</small>
            </button>
          ))}
        </div>
        {filteredOrders.length === 0 && <div className="empty-state">No Orders match this search.</div>}
      </aside>

      <section className="reference-detail">
        <div className="rules-callout" style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.65rem' }}>{ORDER_DOCTRINE.whatItIs}</p>
          <p style={{ margin: '0 0 0.65rem' }}>{ORDER_DOCTRINE.abilitiesVsWorkings}</p>
          <p style={{ margin: '0 0 0.65rem' }}>{ORDER_DOCTRINE.whyMixed}</p>
          <p className="muted" style={{ margin: 0 }}>
            {ORDER_DOCTRINE.pickThree} The same three appear on the{' '}
            <Link to="/characters">civic sheet</Link>. Casters pay Exert. The reckless pay Drift.
            Everyone else pays with the object — see <RuleLink section="signatures" />.
          </p>
        </div>

        <span className="eyebrow">Order Record</span>
        <h2 style={{ margin: '0.35rem 0 0.4rem', color: 'var(--color-primary)', fontSize: '2rem' }}>
          {selectedOrder.name}
        </h2>
        <p className="muted" style={{ marginTop: 0, fontStyle: 'italic' }}>
          {selectedOrder.fieldFunction}
        </p>

        <p style={{ lineHeight: 1.65, marginTop: '1rem' }}>{selectedOrder.identity}</p>
        <p className="muted" style={{ lineHeight: 1.65 }}>
          {selectedOrder.notThis}
        </p>

        <h4>How to play this</h4>
        <ul style={{ margin: '0.35rem 0 1rem', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
          {selectedOrder.howToPlay.map((tip) => (
            <li key={tip} className="muted">
              {tip}
            </li>
          ))}
        </ul>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', margin: '1.5rem 0' }}>
          <div>
            <h4>Approaches</h4>
            <div className="chip-row">
              {selectedOrder.approaches.map((approach) => (
                <span className="chip" key={approach}>
                  {approach}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4>Signatures — pay with the object</h4>
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: 0 }}>
              Not bonuses. Commit (busy), Mark (worn), or Give (gone).
            </p>
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              {selectedOrder.signatures.map((signatureName) => {
                const signature = findSignature(signatureName);
                return (
                  <div
                    key={signatureName}
                    className="panel"
                    style={{ background: 'var(--color-background)', padding: '0.55rem 0.75rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'baseline' }}>
                      <strong style={{ color: 'var(--color-primary)' }}>{signatureName}</strong>
                      {signature && (
                        <span className="chip" style={{ fontSize: '0.65rem' }}>
                          {signature.property} · {signature.cost}
                        </span>
                      )}
                    </div>
                    <p className="muted" style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {signature?.text ?? 'A Signature the table names. One sentence, one cost.'}
                    </p>
                  </div>
                );
              })}
            </div>
            {selectedOrder.signatureTips && (
              <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.1rem', lineHeight: 1.55 }}>
                {selectedOrder.signatureTips.map((tip) => (
                  <li key={tip} className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <h4>Starter abilities — choose {ORDER_STARTER_PICK}</h4>
        <p className="muted" style={{ marginTop: 0, fontSize: '0.875rem' }}>
          These cost nothing. They are what the warrant already permits. Italics on the card, if any, are Workings:
          they cost Exert, or they cost the world.
        </p>
        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
          {selectedOrder.abilities.map((ability) => (
            <AbilityCard
              key={ability.name}
              ability={ability}
              isOpen={expandedAbility === ability.name}
              onToggle={() => setExpandedAbility(expandedAbility === ability.name ? null : ability.name)}
            />
          ))}
        </div>

        {selectedOrder.laterAbilities && selectedOrder.laterAbilities.length > 0 && (
          <div style={{ marginTop: '1.75rem' }}>
            <h4>Later / optional</h4>
            <p className="muted" style={{ marginTop: 0, fontSize: '0.875rem' }}>
              Not on the Alpha 0.2 starter warrant. Keep them off a new character unless the table agrees to test them.
            </p>
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
              {selectedOrder.laterAbilities.map((ability) => (
                <AbilityCard
                  key={ability.name}
                  ability={ability}
                  isOpen={expandedAbility === ability.name}
                  onToggle={() => setExpandedAbility(expandedAbility === ability.name ? null : ability.name)}
                />
              ))}
            </div>
          </div>
        )}

        <p className="muted" style={{ marginTop: '1.75rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {ORDER_DOCTRINE.standing}
        </p>
      </section>
    </div>
  );
}

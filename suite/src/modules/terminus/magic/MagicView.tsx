import { useMemo, useState } from 'react';
import { Flame, Landmark, Search, ShieldCheck, Sparkles } from 'lucide-react';
import {
  ARCHETYPAL_CASTINGS,
  MAGIC_MODES,
  MAGIC_TABLE_PROCEDURE,
  MAGIC_TERMINOLOGY_BOUNDARIES,
  ORDER_MAGIC_EXPRESSIONS,
  WORKING_VERBS,
} from '../../../data/terminus/magic';
import { ORDERS_LIST } from '../../../data/terminus/orders';

export function MagicView() {
  const [selectedVerbId, setSelectedVerbId] = useState(WORKING_VERBS[0].id);
  const [selectedOrderId, setSelectedOrderId] = useState(ORDERS_LIST[0].id);
  const [query, setQuery] = useState('');

  const selectedVerb = WORKING_VERBS.find((verb) => verb.id === selectedVerbId) || WORKING_VERBS[0];
  const selectedOrder = ORDERS_LIST.find((order) => order.id === selectedOrderId) || ORDERS_LIST[0];
  const orderCastings = ARCHETYPAL_CASTINGS.filter((casting) => casting.orderId === selectedOrder.id);

  const filteredVerbs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return WORKING_VERBS;

    return WORKING_VERBS.filter((verb) => {
      const searchable = [
        verb.name,
        verb.summary,
        ...verb.canDo,
        ...verb.cannotDo,
        ...verb.examples,
      ].join(' ').toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  const modeIcon = {
    'sanctioned-working': ShieldCheck,
    'rupture-casting': Flame,
    'old-office-rite': Landmark,
  };

  return (
    <div className="magic-page">
      <section className="page-header">
        <span className="eyebrow">Alpha Rules</span>
        <h2>Magic and Civic Workings</h2>
        <p>
          Magic changes what reality accepts. It is permission, law, oath,
          infrastructure, rite, and controlled exception before it is spectacle.
        </p>
      </section>

      <section className="magic-mode-grid">
        {MAGIC_MODES.map((mode) => {
          const Icon = modeIcon[mode.id as keyof typeof modeIcon] || Sparkles;
          return (
            <article className="panel magic-mode-card" key={mode.id}>
              <Icon size={22} />
              <h3>{mode.name}</h3>
              <p>{mode.summary}</p>
              <dl>
                <dt>Cost</dt>
                <dd>{mode.cost}</dd>
                <dt>Effect</dt>
                <dd>{mode.effect}</dd>
                <dt>Consequence</dt>
                <dd>{mode.consequence}</dd>
              </dl>
            </article>
          );
        })}
      </section>

      <section className="panel magic-boundary-panel">
        <div className="section-heading">
          <span className="eyebrow">Terminology Boundary</span>
          <h2>Rupture is not a fifth verb</h2>
          <p className="muted">
            Sanctioned Workings use the controlled vocabulary. Rupture is the condition
            the Orders answer, and Rupture Casting is the unlicensed method that spends Drift.
          </p>
        </div>
        <div className="magic-boundary-grid">
          {MAGIC_TERMINOLOGY_BOUNDARIES.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="reference-layout magic-reference-layout">
        <aside>
          <div className="page-header">
            <h2>Working Verbs</h2>
            <p>Four verbs keep the system broad without becoming a spell catalog.</p>
          </div>
          <label className="chip" htmlFor="magic-search">
            <Search size={15} /> Search Workings
          </label>
          <input
            id="magic-search"
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Seal, ward, bridge, contract..."
          />
          <div className="reference-list">
            {filteredVerbs.map((verb) => (
              <button
                className={selectedVerb.id === verb.id ? 'reference-button active' : 'reference-button'}
                key={verb.id}
                onClick={() => setSelectedVerbId(verb.id)}
              >
                <h3>{verb.name}</h3>
                <small>{verb.summary}</small>
              </button>
            ))}
          </div>
          {filteredVerbs.length === 0 && (
            <div className="empty-state">No Workings match this search.</div>
          )}
        </aside>

        <article className="reference-detail">
          <span className="eyebrow">Working Verb</span>
          <h2 style={{ margin: '0.35rem 0 0.5rem', color: 'var(--color-primary)' }}>
            {selectedVerb.name}
          </h2>
          <p>{selectedVerb.summary}</p>

          <div className="magic-detail-grid">
            <div>
              <h4>Can Do</h4>
              <ul>
                {selectedVerb.canDo.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4>Cannot Do</h4>
              <ul>
                {selectedVerb.cannotDo.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>

          <h4>Examples</h4>
          <div className="magic-example-list">
            {selectedVerb.examples.map((example) => (
              <span className="chip" key={example}>{example}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="panel magic-rotes-section">
        <div className="section-heading">
          <span className="eyebrow">Buttons To Press</span>
          <h2>Archetypal Castings</h2>
          <p className="muted">
            Rotes are reliable, pre-approved Workings for players who want concrete effects.
            They are examples of the verb engine, not a separate spell list.
          </p>
        </div>

        <div className="chip-row magic-order-tabs">
          {ORDERS_LIST.map((order) => (
            <button
              key={order.id}
              className={selectedOrder.id === order.id ? 'tab-button active' : 'tab-button'}
              onClick={() => setSelectedOrderId(order.id)}
            >
              {order.name}
            </button>
          ))}
        </div>

        <div className="magic-casting-grid">
          {orderCastings.map((casting) => (
            <article className="panel magic-casting-card" key={casting.id}>
              <div className="chip-row">
                <span className="chip">{casting.verb}</span>
                <span className="chip">{casting.cost}</span>
              </div>
              <h3>{casting.name}</h3>
              <dl>
                <dt>Anchor</dt>
                <dd>{casting.anchor}</dd>
                <dt>Effect</dt>
                <dd>{casting.effect}</dd>
                <dt>Limit</dt>
                <dd>{casting.limit}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="magic-bottom-grid">
        <article className="panel">
          <span className="eyebrow">At The Table</span>
          <h3>Procedure</h3>
          <ol className="procedure-list">
            {MAGIC_TABLE_PROCEDURE.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>

        <article className="panel">
          <span className="eyebrow">Orders</span>
          <h3>Expressions</h3>
          <div className="order-expression-list">
            {ORDER_MAGIC_EXPRESSIONS.map((entry) => {
              const order = ORDERS_LIST.find((item) => item.id === entry.orderId);
              return (
                <div key={entry.orderId}>
                  <strong>{order?.name || entry.orderId}</strong>
                  <p>{entry.expression}</p>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

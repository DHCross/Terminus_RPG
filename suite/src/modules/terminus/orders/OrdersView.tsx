import { useState } from 'react';
import { ORDERS_LIST, type OrderInfo } from '../../../data/terminus/orders';

export function OrdersView() {
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo>(ORDERS_LIST[0]);

  return (
    <div className="orders-view" style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
      <div className="orders-list" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>The Orders</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Orders are social powers, field roles, and play identities. They exist because stable systems cannot resolve rupture remotely.
        </p>
        {ORDERS_LIST.map(order => (
          <button
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            style={{
              padding: '1rem',
              background: selectedOrder.id === order.id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
              border: `1px solid ${selectedOrder.id === order.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              color: 'var(--color-text)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <h3 style={{ margin: 0 }}>{order.name}</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {order.fieldFunction}
            </div>
          </button>
        ))}
      </div>

      <div className="order-details" style={{ flex: '2', background: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '2rem' }}>{selectedOrder.name}</h2>
        <div style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {selectedOrder.fieldFunction}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-text)' }}>Approaches</h4>
            <ul style={{ color: 'var(--color-text-muted)', paddingLeft: '1.25rem' }}>
              {selectedOrder.approaches.map(app => <li key={app}>{app}</li>)}
            </ul>
          </div>
          <div>
            <h4 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-text)' }}>Signatures</h4>
            <ul style={{ color: 'var(--color-text-muted)', paddingLeft: '1.25rem' }}>
              {selectedOrder.signatures.map(sig => <li key={sig}>{sig}</li>)}
            </ul>
          </div>
        </div>

        <div>
          <h4 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-text)' }}>Starter Abilities</h4>
          {selectedOrder.abilities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {selectedOrder.abilities.map(ability => (
                <div key={ability.name} style={{ background: 'var(--color-background)', padding: '1rem', borderRadius: '6px' }}>
                  <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem' }}>{ability.name}</strong>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{ability.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '1rem' }}>Pending alpha text...</p>
          )}
        </div>
      </div>
    </div>
  );
}

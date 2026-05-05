import { useState } from 'react';
import { SPECIES_LIST, type SpeciesInfo } from '../../../data/terminus/species';

export function SpeciesView() {
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesInfo>(SPECIES_LIST[0]);

  return (
    <div className="species-view" style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
      <div className="species-list" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>Lineages</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Species gives origin, body, inheritance, and one or two small tendencies or exceptions. Species should not replace Order identity.
        </p>
        {SPECIES_LIST.map(species => (
          <button
            key={species.id}
            onClick={() => setSelectedSpecies(species)}
            style={{
              padding: '1rem',
              background: selectedSpecies.id === species.id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
              border: `1px solid ${selectedSpecies.id === species.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              color: 'var(--color-text)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <h3 style={{ margin: 0 }}>{species.name}</h3>
          </button>
        ))}
      </div>

      <div className="species-details" style={{ flex: '2', background: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <h2 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)', fontSize: '2rem' }}>{selectedSpecies.name}</h2>
        <div style={{ color: 'var(--color-text)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {selectedSpecies.description}
        </div>

        <div>
          <h4 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-text)' }}>Alpha Trait</h4>
          <div style={{ background: 'var(--color-background)', padding: '1.5rem', borderRadius: '6px', marginTop: '1rem' }}>
            <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              {selectedSpecies.traitName}
            </strong>
            <span style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              {selectedSpecies.traitDescription}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

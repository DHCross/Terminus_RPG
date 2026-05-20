import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SPECIES_LIST, type SpeciesInfo } from '../../../data/terminus/species';
import { RuleLink } from '../rules/RuleLink';

export function SpeciesView() {
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesInfo>(SPECIES_LIST[0]);
  const [query, setQuery] = useState('');

  const filteredSpecies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return SPECIES_LIST;

    return SPECIES_LIST.filter((species) => {
      const searchable = [
        species.name,
        species.description,
        species.traitName,
        species.traitDescription,
      ].join(' ').toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <div className="reference-layout">
      <aside>
        <div className="page-header">
          <h2>Lineages</h2>
          <p>Origin, body, inheritance, and small exceptions without replacing Order identity.</p>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            <RuleLink section="species" block />
          </p>
        </div>
        <label className="chip" htmlFor="species-search">
          <Search size={15} /> Search Lineages
        </label>
        <input
          id="species-search"
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Alfar, stable, pressure..."
        />
        <div className="reference-list">
          {filteredSpecies.map((species) => (
            <button
              key={species.id}
              onClick={() => setSelectedSpecies(species)}
              className={selectedSpecies.id === species.id ? 'reference-button active' : 'reference-button'}
            >
              <h3>{species.name}</h3>
              <small>{species.description}</small>
            </button>
          ))}
        </div>
        {filteredSpecies.length === 0 && (
          <div className="empty-state">No Lineages match this search.</div>
        )}
      </aside>

      <section className="reference-detail">
        <span className="eyebrow">Lineage Record</span>
        <h2 style={{ margin: '0.35rem 0 1rem', color: 'var(--color-primary)', fontSize: '2rem' }}>
          {selectedSpecies.name}
        </h2>

        {/* Asset slot */}
        {selectedSpecies.assetPath ? (
          <div style={{
            width: '100%', maxWidth: '360px', aspectRatio: '16/9',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            marginBottom: '1.25rem',
            overflow: 'hidden',
          }}>
            <img src={selectedSpecies.assetPath} alt={selectedSpecies.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{
            width: '100%', maxWidth: '360px', aspectRatio: '16/9',
            background: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              No image
            </span>
          </div>
        )}

        <p style={{ color: 'var(--color-text)', fontSize: '1.05rem' }}>
          {selectedSpecies.description}
        </p>

        {/* Origin in Tringad */}
        {(selectedSpecies.homelands || selectedSpecies.civicRelation || selectedSpecies.strainMarker || selectedSpecies.commonOldOffices) && (
          <article className="panel" style={{ background: 'var(--color-background)', marginTop: '1.5rem' }}>
            <span className="eyebrow">Origin in Tringad</span>

            {selectedSpecies.homelands && selectedSpecies.homelands.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Homelands</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedSpecies.homelands.map(h => (
                    <span key={h} style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.55rem',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: '3px', color: 'var(--color-text)',
                    }}>{h}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedSpecies.civicRelation && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Civic Relation</p>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedSpecies.civicRelation}</p>
              </div>
            )}

            {selectedSpecies.strainMarker && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Strain Marker</p>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic' }}>{selectedSpecies.strainMarker}</p>
              </div>
            )}

            {selectedSpecies.commonOldOffices && selectedSpecies.commonOldOffices.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Common Old Offices</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedSpecies.commonOldOffices.map(o => (
                    <span key={o} style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.55rem',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: '3px', color: 'var(--color-text)',
                    }}>{o}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}

        <article className="panel" style={{ background: 'var(--color-background)', marginTop: '1.5rem' }}>
          <span className="eyebrow">Alpha Trait</span>
          <h3 style={{ margin: '0.35rem 0 0.5rem', color: 'var(--color-primary)' }}>
            {selectedSpecies.traitName}
          </h3>
          <p className="muted" style={{ margin: 0 }}>
            {selectedSpecies.traitDescription}
          </p>
        </article>
      </section>
    </div>
  );
}

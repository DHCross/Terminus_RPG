import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SPECIES_LIST, type SpeciesInfo } from '../../../data/terminus/species';

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
        <p style={{ color: 'var(--color-text)', fontSize: '1.05rem' }}>
          {selectedSpecies.description}
        </p>

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

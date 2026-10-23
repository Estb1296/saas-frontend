import React, { useState, useEffect } from 'react';
import { tenantApi } from '../../api/tenantApi';
import type {Tenant} from '../../types/admin';

export const TenantDashboard: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');

    const loadTenants = async () => {
        try {
            const data = await tenantApi.getAllTenants();
            setTenants(data);
        } catch (err) {
            console.error('Failed to load tenants', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Wrapping in an async IIFE prevents synchronous state mutation warnings
        const fetchData = async () => {
            await loadTenants();
        };
        void fetchData();
    }, []);

    const handleAddTenant = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await tenantApi.createTenant({
                name,
                slug: slug.toLowerCase().replace(/\s+/g, '-'),
                ownerEmail,
                ownerFullName: 'Business Owner',
                initialThemeId: 'modern_minimal',
            });
            setShowAddModal(false);
            setName('');
            setSlug('');
            setOwnerEmail('');
            await loadTenants();
        } catch (err) {
            console.error('Failed to onboard tenant', err);
            alert('Failed to onboard tenant.');
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>SaaS Admin Portal</h1>
                    <p style={{ color: '#666', margin: '0.25rem 0 0 0' }}>Manage client restaurant tenants & live storefronts</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{ padding: '0.75rem 1.25rem', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Onboard New Business
                </button>
            </header>

            {loading ? (
                <p>Loading active businesses...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                    <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
                        <th style={{ padding: '1rem' }}>ID</th>
                        <th style={{ padding: '1rem' }}>Business Name</th>
                        <th style={{ padding: '1rem' }}>Subdomain / Slug</th>
                        <th style={{ padding: '1rem' }}>Owner Email</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Live Storefront</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tenants.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '1rem' }}>{t.id}</td>
                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.name}</td>
                            <td style={{ padding: '1rem' }}>
                                <code style={{ background: '#F3F4F6', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>/{t.slug}</code>
                            </td>
                            <td style={{ padding: '1rem' }}>{t.ownerEmail}</td>
                            <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', background: '#D1FAE5', color: '#065F46', fontWeight: '600' }}>
                    {t.status || 'ACTIVE'}
                  </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <a
                                    href={`http://localhost:5173/store/${t.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '500' }}
                                >
                                    Launch Live Demo ↗
                                </a>
                            </td>
                        </tr>
                    ))}
                    {tenants.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                No business tenants onboarded yet. Click "+ Onboard New Business" to add your first client.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}

            {/* Onboarding Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '420px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginTop: 0 }}>Onboard Business</h2>
                        <form onSubmit={handleAddTenant}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Business Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mario's Pizzeria"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>URL Slug</label>
                                <input
                                    type="text"
                                    placeholder="e.g. marios-pizza"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Owner Email</label>
                                <input
                                    type="email"
                                    placeholder="owner@marios.com"
                                    value={ownerEmail}
                                    onChange={(e) => setOwnerEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Save & Onboard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
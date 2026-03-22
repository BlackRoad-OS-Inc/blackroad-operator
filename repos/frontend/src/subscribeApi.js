import axios from 'axios';
import { API_BASE } from './api';

const BASE = API_BASE;

function url(path) {
  return path.startsWith('/') ? `${BASE}${path}` : `${BASE}/${path}`;
}

export async function fetchPlans() {
  const { data } = await axios.get(url('/api/subscribe/plans'));
  return data;
}

export async function fetchConfig() {
  const { data } = await axios.get(url('/api/subscribe/config'));
  return data;
}

export async function fetchStatus() {
  const { data } = await axios.get(url('/api/subscribe/status'));
  return data;
}

export async function startCheckout(plan, billing_cycle, coupon) {
  const { data } = await axios.post(url('/api/subscribe/checkout'), {
    plan,
    billing_cycle,
    coupon,
  });
  return data;
}

export async function openPortal() {
  const { data } = await axios.get(url('/api/subscribe/portal'));
  return data;
}

export async function fetchFeatureGates() {
  const { data } = await axios.get(url('/api/subscribe/feature-gates'));
  return data;
}

export async function startConnector(service) {
  const encoded = encodeURIComponent(service);
  const { data } = await axios.get(url(`/api/connect/google/start?service=${encoded}`));
  return data;
}

export async function revokeConnector(service) {
  const { data } = await axios.post(url('/api/connect/google/revoke'), { service });
  return data;
}

export async function fetchOnboardingSlots() {
  const { data } = await axios.get(url('/api/subscribe/onboarding/slots'));
  return data;
}

export async function bookOnboarding(slot) {
  const { data } = await axios.post(url('/api/subscribe/onboarding/book'), { slot });
  return data;
}

export async function fetchHealth() {
  const { data } = await axios.get(url('/api/subscribe/health'));
  return data;
}

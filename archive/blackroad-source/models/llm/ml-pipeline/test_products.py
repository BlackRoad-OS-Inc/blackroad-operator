"""Tests for production product catalog."""

import os
import pytest
from products import (
    PRODUCTS,
    Product,
    get_product,
    list_products,
    list_product_ids,
)


class TestProductCatalog:
    def test_products_not_empty(self):
        assert len(PRODUCTS) > 0

    def test_all_products_have_required_fields(self):
        for p in PRODUCTS:
            assert p.id
            assert p.name
            assert p.description
            assert p.tier in ("free", "pro", "enterprise")
            assert p.stripe_price_env
            assert len(p.features) > 0
            assert len(p.pipeline_stages) > 0

    def test_unique_product_ids(self):
        ids = [p.id for p in PRODUCTS]
        assert len(ids) == len(set(ids))

    def test_all_tiers_represented(self):
        tiers = {p.tier for p in PRODUCTS}
        assert "free" in tiers
        assert "pro" in tiers
        assert "enterprise" in tiers

    def test_pipeline_stages_are_valid(self):
        valid_stages = {"DataIngestion", "FeatureEngineering", "Training", "Evaluation", "Deployment"}
        for p in PRODUCTS:
            for stage in p.pipeline_stages:
                assert stage in valid_stages, f"{p.id} has invalid stage {stage}"


class TestGetProduct:
    def test_get_existing(self):
        p = get_product("ml_pipeline_pro")
        assert p is not None
        assert p.name == "ML Pipeline Pro"

    def test_get_missing(self):
        assert get_product("nonexistent") is None


class TestListProducts:
    def test_list_all(self):
        products = list_products()
        assert len(products) == len(PRODUCTS)

    def test_filter_by_tier(self):
        free = list_products(tier="free")
        assert all(p["tier"] == "free" for p in free)
        assert len(free) >= 1

    def test_to_dict_includes_stripe_price_id(self):
        products = list_products()
        for p in products:
            assert "stripe_price_id" in p

    def test_stripe_price_from_env(self, monkeypatch):
        monkeypatch.setenv("STRIPE_PRICE_PRO", "price_abc123")
        p = get_product("ml_pipeline_pro")
        assert p.stripe_price_id == "price_abc123"

    def test_stripe_price_empty_when_unset(self, monkeypatch):
        monkeypatch.delenv("STRIPE_PRICE_PRO", raising=False)
        p = get_product("ml_pipeline_pro")
        assert p.stripe_price_id == ""


class TestListProductIds:
    def test_returns_all_ids(self):
        ids = list_product_ids()
        assert len(ids) == len(PRODUCTS)
        assert "ml_pipeline_free" in ids
        assert "ml_pipeline_pro" in ids
        assert "ml_pipeline_enterprise" in ids

<?php

namespace Tests\Feature;

use Tests\TestCase;

class DocumentationRouteTest extends TestCase
{
    public function test_api_documentation_page_is_accessible(): void
    {
        $response = $this->get('/docs/api');
        $response->assertStatus(200);
        $response->assertSee('Smart Waste Management - REST API Docs');
    }

    public function test_api_documentation_alias_is_accessible(): void
    {
        $response = $this->get('/api/documentation');
        $response->assertStatus(200);
    }

    public function test_openapi_yaml_spec_is_accessible(): void
    {
        $response = $this->get('/api/documentation.yaml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/x-yaml');
        $response->assertSee('openapi: 3.0.3');
    }
}


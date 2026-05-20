require "stimulus_grid_rails/version"
require "stimulus_grid_rails/engine"
require "stimulus_grid_rails/column"
require "stimulus_grid_rails/grid"
require "stimulus_grid_rails/turbo_streams_helper"
require "stimulus_grid_rails/concerns/broadcastable"

module StimulusGridRails
  class << self
    # Base class for the gem's controllers. Set to your authenticated base
    # controller so Devise (authenticate_user!) and ActsAsTenant
    # (set_current_tenant_through_filter) before_actions apply to the grid's
    # cell/row endpoints too — otherwise they'd run unauthenticated and
    # unscoped, leaking across tenants.
    #
    #   StimulusGridRails.parent_controller = "ApplicationController"  # default
    attr_writer :parent_controller

    def parent_controller
      @parent_controller ||= "ApplicationController"
    end

    # Where the engine is mounted. The grid's client-side endpoints are built
    # from this, so it must match how you mount the engine:
    #
    #   # config/initializers/stimulus_grid_rails.rb
    #   StimulusGridRails.mount_path = "/admin/grids"
    #
    #   # config/routes.rb
    #   mount StimulusGridRails::Engine => StimulusGridRails.mount_path
    #
    # Using the same value in both places keeps the browser requests and the
    # routes in sync regardless of namespace/scope. Default "/grids".
    def mount_path
      @mount_path || "/grids"
    end

    def mount_path=(path)
      @mount_path = path.to_s.sub(%r{/+\z}, "")   # strip trailing slash(es)
    end
  end

  # Per-process registry of ApplicationGrid subclasses, keyed by `resource`.
  # Populated lazily when a Grid subclass is instantiated, so the cells
  # controller can resolve `/grids/:resource/...` back to the right Grid class.
  def self.registry
    @registry ||= {}
  end

  def self.register_grid(resource, klass)
    registry[resource.to_s] = klass
  end

  def self.lookup_grid(resource)
    registry[resource.to_s] or
      raise ArgumentError, "No grid registered for resource #{resource.inspect}. " \
                           "Did you define a Grid subclass and reference it from a view?"
  end

  # Tenant-isolation token for stream names (RAILS.md §2). When the app uses
  # ActsAsTenant and a tenant is set, this returns a per-tenant token so a
  # broadcast for one tenant can never reach another tenant's subscribers,
  # even when grids share a logical stream name. Returns nil when not
  # multi-tenant. Both the broadcaster (model callback) and the subscriber
  # (turbo_stream_from in the view) run in the same request/tenant context, so
  # they derive the same token and match.
  def self.tenant_stream_token
    return nil unless defined?(ActsAsTenant) && ActsAsTenant.respond_to?(:current_tenant)
    tenant = ActsAsTenant.current_tenant
    tenant ? "sgr-tenant:#{tenant.class.name}:#{tenant.id}" : nil
  end

  # The streamables a grid's broadcasts + subscription share. Tenant-scoped
  # automatically. Pass extra view-scoping tokens (e.g. a signed view name)
  # as needed.
  def self.streamables_for(resource, *extra)
    [tenant_stream_token, "sgr-grid:#{resource}", *extra].compact
  end
end

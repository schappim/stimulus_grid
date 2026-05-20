require "stimulus_grid_rails/version"
require "stimulus_grid_rails/engine"
require "stimulus_grid_rails/column"
require "stimulus_grid_rails/grid"
require "stimulus_grid_rails/turbo_streams_helper"
require "stimulus_grid_rails/concerns/broadcastable"

module StimulusGridRails
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
end

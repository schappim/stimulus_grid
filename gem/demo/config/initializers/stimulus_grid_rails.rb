# Namespace the grid endpoints under /admin/grids to demonstrate that the mount
# path is configurable. The _grid partial builds its client-side endpoints from
# this value, and routes.rb mounts the engine here, so the two stay in sync.
StimulusGridRails.mount_path = "/admin/grids"

# If your app puts the grid behind Devise + ActsAsTenant, point this at your
# authenticated base controller so those before_actions run on grid endpoints:
# StimulusGridRails.parent_controller = "ApplicationController"

<div id="modal-target-{{ sanitize_title($section['section_title']) }}-audio" data-section-name="{{ sanitize_title($section['section_title']) }}" class="modal modal-backdrop-4 modal-medium modal-karnan modal-audio" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <div class="modal-header">
            <a  data-action="modal-close" class="btn btn-close close" href="#{{ sanitize_title($section['section_title']) }}"></a>
        </div>
        <div class="modal-body container">
            <div class="grid">
                <div class="grid-md-12">
                    <div class="content">
                        {!! $section['soundcloud'] !!}
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <a data-action="modal-close" href="#{{ sanitize_title($section['section_title']) }}" class="btn btn-primary btn-block close"><?php _e('Go back', 'karnan'); ?></a>
        </div>
    </div><!-- /.modal-content -->
    <a href="#" class="backdrop"></a>
</div><!-- /.modal -->

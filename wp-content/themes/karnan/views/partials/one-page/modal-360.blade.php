<div id="modal-target-{{ sanitize_title($section['section_title']) }}-360" data-section-name="{{ sanitize_title($section['section_title']) }}" class="modal modal-backdrop-white modal-large modal-karnan" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <div class="modal-header">

            <a class="btn btn-close close" href="#{{ sanitize_title($section['section_title']) }}"></a>
        </div>
        <div class="modal-body container">
            <div class="grid">
                <div class="grid-md-12">
                    <div class="content">
                           <iframe src="{{ $section['google_maps'] }}" width="100%" height="100vh" frameborder="0" style="border:0" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <a href="#{{ sanitize_title($section['section_title']) }}" class="btn btn-primary btn-block close"><?php _e('Go back', 'karnan'); ?></a>
        </div>
    </div><!-- /.modal-content -->
    <a href="#" class="backdrop"></a>
</div><!-- /.modal -->

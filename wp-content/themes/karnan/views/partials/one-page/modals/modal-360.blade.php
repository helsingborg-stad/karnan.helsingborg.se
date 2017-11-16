<div id="modal-target-{{ sanitize_title($section['section_title']) }}-360" data-section-name="{{ sanitize_title($section['section_title']) }}" class="modal modal-backdrop-white modal-large modal-karnan modal-360" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <div class="modal-header">
            <a data-action="modal-close" class="btn btn-close" href="#{{ sanitize_title($section['section_title']) }}"></a>
        </div>
        <div class="modal-body">
               <iframe src="{{ $section['google_maps'] }}" width="100%" height="100%" frameborder="0" style="border:0" allowfullscreen></iframe>
        </div>

        <div class="modal-footer">
            <a data-action="modal-close" href="#{{ sanitize_title($section['section_title']) }}" class="btn btn-primary btn-block"><?php _e('Go back', 'karnan'); ?></a>
        </div>
    </div><!-- /.modal-content -->
    <a href="#" class="backdrop"></a>
</div><!-- /.modal -->

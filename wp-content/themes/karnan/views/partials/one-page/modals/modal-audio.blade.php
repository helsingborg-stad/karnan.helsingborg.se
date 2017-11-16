<div id="modal-target-{{ sanitize_title($section['section_title']) }}-audio" data-section-name="{{ sanitize_title($section['section_title']) }}" class="modal modal-backdrop-white modal-large modal-karnan modal-audio" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <div class="modal-header">
            <a class="btn btn-close close" href="#{{ sanitize_title($section['section_title']) }}"></a>
        </div>
        <div class="modal-body container">
            <div class="grid">
                <div class="grid-md-12">
                    <div class="content">
                        <iframe width="100%" height="300" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/260217789&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"></iframe>
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

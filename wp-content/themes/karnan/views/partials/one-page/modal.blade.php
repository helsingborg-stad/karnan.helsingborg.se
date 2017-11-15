<div id="modal-target-{{ sanitize_title($section['section_title']) }}" data-section-name="{{ sanitize_title($section['section_title']) }}" class="modal modal-backdrop-white modal-large modal-karnan" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <div class="modal-header">

            <a class="btn btn-close close" href="#{{ sanitize_title($section['section_title']) }}"></a>
        </div>
        <div class="modal-body container">
            <div class="grid">
                <div class="grid-sm-4 hidden-xs">
                    <div class="image">
                        @if(!empty($section['section_image']['url']))
                            <img src="{{ $section['section_image']['url'] }}" alt="{{ $section['section_title'] }}">
                        @endif
                    </div>
                </div>
                <div class="grid-sm-7">
                    <div class="content">
                        <h2 class="modal-title">{{ $section['section_title'] }}</h2>
                        @if(!empty($section['section_image']['url']))
                        <img class="hidden-sm hidden-md hidden-lg" src="{{ $section['section_image']['url'] }}" alt="{{ $section['section_title'] }}">
                        @endif
                        {!! $section['content_guide'] !!}
                    </div>
                    @if(!empty($section['section_audioguide']))
                        <div class="audio-player">
                            <audio controls controlsList="nodownload">
                                <source src="{{ $section['section_audioguide'] }}" type="audio/mpeg">
                            </audio>
                            <div class="album-art" style="background-image: url('{{ $section['section_audioguide_albumbart'] }}');">
                                <a href="#play" class="toggle-action-play pricon pricon-play"></a>
                                <a href="#play" class="toggle-action-pause pricon pricon-pause"></a>
                            </div>
                            <input type="range" class="action-seek" value="0" max="100" step="0.01"/>
                        </div>
                    @endif
                    @if(!empty($section['gallery']))
                        <div class="gallery">
                            <ul class="image-gallery grid grid-gallery">
                                @foreach($section['gallery'] as $image)
                                <li class="grid-md-4 grid-xs-6">
                                    <a class="box lightbox-trigger" href="{{ $image['sizes']['large'] }}">
                                        {!! wp_get_attachment_image($image['ID'], array('250', '170')) !!}
                                    </a>
                                </li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <a href="#{{ sanitize_title($section['section_title']) }}" class="btn btn-primary btn-block close"><?php _e('Go back', 'karnan'); ?></a>
        </div>
    </div><!-- /.modal-content -->
    <a href="#" class="backdrop"></a>
</div><!-- /.modal -->

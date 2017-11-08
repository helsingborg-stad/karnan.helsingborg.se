<div class="grid-md-12">
    {!! $section['content'] !!}
    <p>
        <a href="{{ $virtualGuidePage }}#{{ sanitize_title($section['section_title']) }}" class="btn btn btn-light"><?php _e("Show the virual guide", 'karnan'); ?></a>
    </p>
</div>

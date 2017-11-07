@extends('templates.master')

@section('content')

@include ('partials/stripe')
@include ('partials/one-page/elevator')
@include ('partials/one-page/scroll-up')

<div id="one-page-content" class="parallax-enabled">
    <!--
    <div id="parallax-level-1" data-stellar-ratio="0.1"></div>
    <div id="parallax-level-2" data-stellar-ratio="1"></div>
    <div id="parallax-level-3" data-stellar-ratio="1.8"></div>
    -->

    <div class="layer-karnan"><img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/karnan-full-with-grass.png"></div>

    <div id="inner">
        @if(is_array($sections) && !empty($sections))
            @foreach ($sections as $key => $section)
                <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section fluid-type">
                    <div class="flex v-center full-height">
                        <div class="container full-width">
                        <div class="grid">
                            <div class="grid-xs-12 grid-md-12">
                                <article>
                                    <header>

                                        <h2>{!! $section['section_title_span'] !!} ({{ $section['height_indicator'] }}<?php _e("m", 'karnan'); ?>)</h2>
                                    </header>
                                    <div class="content">
                                        {!! $section['content'] !!}
                                        <p>
                                            <a href="{{ $virtualGuidePage }}#{{ sanitize_title($section['section_title']) }}" class="h2 virtual-guide"><?php _e("Show the virual guide", 'karnan'); ?> <i class="pricon pricon-chevron-right"></i></a>
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                    </div>

                </section>
            @endforeach
        @endif
    </div>
</div>

@include ('partials/one-page/scroll-down')

@stop

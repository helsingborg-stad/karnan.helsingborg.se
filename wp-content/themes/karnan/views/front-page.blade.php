@extends('templates.master')

@section('content')

@include ('partials/stripe')
@include ('partials/one-page/elevator')
@include ('partials/one-page/scroll-up')

<div id="one-page-content" class="parallax-enabled">

    <div class="layer-wrapper">
        <div class="layer depth-1 layer-gras">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/grass/png/400.png">
        </div>
        <div class="layer depth-2 layer-tower">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/karnan/png/400.png">
        </div>

        <div class="layer depth-1 layer-city-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top/city/png/400.png">
        </div>
        <div class="layer depth-1 layer-greenarea-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top/greenarea/png/400.png">
        </div>
        <div class="layer depth-2 layer-tower-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top/tower/png/400.png">
        </div>
    </div>

    <div id="inner">
        <!--@include ('partials/one-page/live-section')-->

        @if(is_array($sections) && !empty($sections))
            @foreach ($sections as $key => $section)
                <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section fluid-type">
                    <div class="flex v-center full-height">
                        <div class="container full-width">
                            <div class="grid">
                                <div class="grid-xs-12 grid-md-12">
                                    <article class="full">
                                        <header>
                                            <h2>
                                                {!! $section['section_title_span'] !!}
                                                <small>
                                                ({{ $section['height_indicator'] }}<?php _e("m", 'karnan'); ?>)
                                                </small>
                                            </h2>
                                        </header>
                                        <div class="content">
                                            {!! $section['content'] !!}
                                            <p>
                                                <a href="{{ $virtualGuidePage }}#{{ sanitize_title($section['section_title']) }}" class="virtual-guide"><?php _e("Show the virual guide", 'karnan'); ?>
                                                    <i class="pricon pricon-chevron-right"></i>
                                                </a>
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

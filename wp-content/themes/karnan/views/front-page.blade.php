@extends('templates.master')

@section('content')

@include ('partials/stripe')
@include ('partials/one-page/elevator')
@include ('partials/one-page/scroll-up')

<div id="one-page-content" class="parallax-enabled">
    <div id="parallax-level-1" data-stellar-ratio="0.1"></div>
    <div id="parallax-level-2" data-stellar-ratio="1"></div>
    <div id="parallax-level-3" data-stellar-ratio="1.8"></div>

    <div id="inner">
        @if(is_array($sections) && !empty($sections))
            @foreach ($sections as $key => $section)
                <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section" style="background-image: url('{{ $section['background'] }}');" >
                    <div class="container">
                        <div class="grid">
                            <div class="grid-xs-12 grid-md-10 grid-lg-8">

                                <article class="box box-filled box-filled-4 animate">
                                    <span class="label hidden-xs">
                                        <span class="inner">
                                            {!! $section['section_title_span'] !!}

                                            <span class="hidden-md hidden-lg h5" style="display: inline-block;">
                                                ({{ $section['height_indicator'] }}<?php _e("m", 'karnan'); ?>)
                                            </span>
                                        </span>
                                    </span>
                                    <div class="box-content">

                                        <h2 class="hidden-sm hidden-md hidden-lg rendered-header">
                                            {{ $section['height_indicator'] }}<?php _e("m", 'karnan'); ?> -
                                            {{ $section['section_title'] }}
                                        </h2>

                                        {!! $section['content'] !!}
                                        <p>
                                            <a href="{{ $virtualGuidePage }}#{{ sanitize_title($section['section_title']) }}" class="h2 virtual-guide"><?php _e("Show the virual guide", 'karnan'); ?> <i class="pricon pricon-chevron-right"></i></a>
                                        </p>

                                        @if($key == 0 )
                                            @include ('partials/one-page/live')
                                        @endif
                                    </div>
                                </article>
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

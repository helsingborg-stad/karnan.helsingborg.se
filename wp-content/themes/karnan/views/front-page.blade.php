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
            @foreach ($sections as $section)
                <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section" style="background-image: url('{{ $section['background'] }}');" >
                    <article class="box box-filled animate">
                        <span class="label"><span class="inner">{{ $section['section_title'] }}</span></span>
                        <div class="box-content">
                            {!! $section['content'] !!}

                            <p>
                                <a href="{{ $virtualGuidePage }}#{{ sanitize_title($section['section_title']) }}" class="btn btn-primary btn-lg virtual-guide"><?php _e("Show the virual guide", 'karnan'); ?> <i class="pricon pricon-chevron-right"></i></a>
                            </p>
                        </div>
                    </article>
                </section>
            @endforeach
        @endif
    </div>
</div>

<!--
<div class="pixel-wrapper">
<div class="pixel" data-stellar-ratio="1.1"></div>
<div class="pixel" data-stellar-ratio="1.2"></div>
<div class="pixel" data-stellar-ratio="1.3"></div>
<div class="pixel" data-stellar-ratio="1.4"></div>
<div class="pixel" data-stellar-ratio="1.5"></div>
<div class="pixel" data-stellar-ratio="1.6"></div>
<div class="pixel" data-stellar-ratio="1.7"></div>
<div class="pixel" data-stellar-ratio="1.8"></div>
<div class="pixel" data-stellar-ratio="1.9"></div>
<div class="pixel" data-stellar-ratio="2.0"></div>
</div> -->

@include ('partials/one-page/scroll-down')

@stop

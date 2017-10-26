@extends('templates.master')

@section('content')

@include ('partials/stripe')
@include ('partials/one-page/elevator')
@include ('partials/one-page/scroll-up')

<div id="one-page-content" class="parallax-enabled">
    <div id="parallax-level-1" data-stellar-background-ratio=".2">
        <div id="parallax-level-2" data-stellar-background-ratio=".5">
            <div id="parallax-level-3">
                <div id="inner">
                    @if(is_array($sections) && !empty($sections))
                        @foreach ($sections as $section)
                            <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section" style="background-image: url('{{ $section['background'] }}');" >
                                <article class="box box-filled animate" data-stellar-ratio="2">
                                    <span class="label"><span class="inner">{{ $section['section_title'] }}</span></span>
                                    <div class="box-content">
                                        {!! $section['content'] !!}
                                    </div>
                                </article>
                            </section>
                        @endforeach
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

@include ('partials/one-page/scroll-down')

@stop

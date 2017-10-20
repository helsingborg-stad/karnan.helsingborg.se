@extends('templates.master')

@section('content')

@include ('partials/stripe')
@include ('partials/one-page/elevator')

<div id="one-page-content">
    <div id="inner">
        @foreach ($sections as $elevatorKey => $section)
            <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="virtual-section">

                <div class="container">
                    <div class="grid">
                        @include ('partials/virtual/image')
                        @include ('partials/virtual/content')
                        @include ('partials/virtual/media')
                    </div>
                </div>

            </section>
        @endforeach
    </div>
</div>

@stop

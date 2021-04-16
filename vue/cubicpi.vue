<template>
  <div>
    <swiper class="swiper" :options="swiperOption" ref="mySwiper">
      <swiper-slide>
        <div class="bbDiv">
          <!-- <div class="date">{{ date }}</div> -->
          <div class="time">{{ time }}</div>
          <!-- <div class="week">{{ week }}</div> -->
          <div class="line"></div>
          <div class="btv">
            <div class="text">
              <div class="fans">{{ countFans }}</div>
              <div class="fansChange">{{ fansChange }}</div>
            </div>
            <div><img src="@/assets/btv.png" height="70px" /></div>
          </div>
          <div class="btv">
            <div class="text">
              <div class="fans">{{ uCountFans }}</div>
              <div class="fansChange">{{ uFansChange }}</div>
            </div>
            <div class="img"><img src="@/assets/youtube.png" height="70px" /></div>
          </div>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="weatherDiv">
          <div class="content">
            <img :src="t_img" class="w_img" />
            <div class="text">{{ t_text }}</div>
            <div class="windScale">{{ t_wind }}</div>
          </div>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="gif1">
          <div class="time">{{ time }}</div>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="light">
          <div class="upt"><img src="@/assets/up.png" height="30px" /></div>
          <div class="icon"><img :src="lightImg" height="80px" /></div>
          <div class="title">摄影灯</div>
          <div class="downt">
            <div class="upt"><img src="@/assets/down.png" height="30px" /></div>
          </div>
        </div>
      </swiper-slide>
      <swiper-slide>
        <div class="light">
          <div class="upt"><img src="@/assets/up.png" height="30px" /></div>
          <div class="icon"><img :src="lightImg2" height="80px" /></div>
          <div class="title">直播灯</div>
          <div class="downt">
            <div class="upt"><img src="@/assets/down.png" height="30px" /></div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <vue-particles
      color="#dedede"
      class="tsparticles"
      :particleSize="8"
      :linesWidth="2"
      :moveSpeed="4"
    ></vue-particles>
  </div>
</template>
<style>
@import url("https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Share:ital,wght@1,700&display=swap");
</style>
<script src="./cubicpi.js"/>

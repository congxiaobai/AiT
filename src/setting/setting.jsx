import React from 'react';
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Divider,
  CardFooter,
  Link,
} from '@nextui-org/react';
import Spark from './Spark';
import Kimi from './Kimi';
import TongYi from './TongYi';
import Words from './Words';
import DouBao from './DouBao';
export default function App() {
  return (
    <div className="px-4 p-12">
      <div className="flex w-full flex-col">
        <Tabs aria-label="Options" isVertical={true}>
          <Tab
            key="spark"
            color={'primary'}
            title={<div className="p-2">讯飞星火</div>}
            className="flex-1"
          >
            <Card>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex flex-col gap-2">
                  <h4 className="text-md">科大讯飞出品</h4>
                  <p className="text-small text-default-500">
                    星火3.5模型，新用户可免费获取200万token
                  </p>
                </div>
              </CardHeader>
              <Divider className="mt-2 mb-2" />
              <CardBody>
                <Spark></Spark>
              </CardBody>
              <Divider className="mt-2 mb-2" />
              <CardFooter>
                <div className="flex-col gap-2">
                  <div> 申请指南</div>
                  <div className="text-md text-default-500 p-1">
                    1.{' '}
                    <Link
                      href="https://passport.xfyun.cn/login"
                      isExternal={true}
                    >
                      点击这里
                    </Link>
                    申请账号
                  </div>
                  <div className="text-md text-default-500 p-1">
                    2.{' '}
                    <Link
                      href="https://console.xfyun.cn/app/myapp"
                      isExternal={true}
                    >
                      点击这里
                    </Link>
                    进入控制台，并创建新应用
                  </div>
                  <div className="text-md text-default-500 p-1">
                    3. 进入应用，在左侧菜单里选择 'Spark3.5 Max'
                  </div>
                  <div className="text-md text-default-500 p-1">
                    4.
                    选中后，在主面板点击立即购买，可以免费领取个人账户200万tooken用量
                  </div>
                  <p>联系作者:congxiaobai1233@gmail.com</p>
                </div>
              </CardFooter>
            </Card>
          </Tab>
          <Tab
            key="kimi"
            title={<div className="p-2">Kimi</div>}
            className="flex-1 max-w-26"
          >
            <Card>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex flex-col">
                  <h4 className="text-md">月之暗面出品</h4>
                  <p className="text-small text-default-500">
                    国内领先的独角兽AI企业，注册送15元费用。计费方式不确定。
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <Kimi></Kimi>
              </CardBody>
              <Divider className="mt-2 mb-2" />
              <CardFooter>
                <div className="flex-col gap-2">
                  <div> 申请指南</div>
                  <div className="text-md text-default-500 p-1">
                    1.{' '}
                    <Link
                      href="https://platform.moonshot.cn/docs/intro#%E4%B8%BB%E8%A6%81%E6%A6%82%E5%BF%B5"
                      isExternal={true}
                    >
                      点击这里
                    </Link>
                    申请账号
                  </div>
                  <div className="text-md text-default-500 p-1">
                    2. 进入控制台，在左侧菜单栏里选择'API Key' 管理
                  </div>
                  <div className="text-md text-default-500 p-1">
                    3. 生成API Key。注意，API
                    Key在生成之后，需要自己复制保存起来，因为只有key只有在生成时可见，其他时间是无法查看的
                  </div>
                  <div className="text-md text-default-500 p-1">
                    4. Kimi翻译会有点慢
                  </div>
                  <p>联系作者:congxiaobai1233@gmail.com</p>
                </div>
              </CardFooter>
            </Card>
          </Tab>
          <Tab
            key="tongyi"
            className="flex-1"
            title={<div className="p-2">通义千问(阿里灵积大模型)</div>}
          >
            <Card>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex flex-col">
                  <h4 className="text-md">阿里巴巴出品</h4>
                  <p className="text-small text-default-500">
                    速度快，质量高，新用户可以申请400万token
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <TongYi></TongYi>
              </CardBody>
              <Divider className="mt-2 mb-2" />
              <CardFooter>
                <div className="flex-col gap-2">
                  <div> 申请指南</div>
                  <div className="text-md text-default-500 p-1">
                    1.{' '}
                    <Link
                      href="https://dashscope.aliyun.com/"
                      isExternal={true}
                    >
                      点击这里
                    </Link>
                    申请账号
                  </div>
                  <div className="text-md text-default-500 p-1">
                    2. <Link
                      href="https://dashscope.console.aliyun.com/model?spm=5176.28630291.0.0.24bf7eb5MIecU5
                      "
                      isExternal={true}
                    >  点击这里
                    </Link>
                    进入控制台，在左侧菜单栏里选择模型广场，选择申请体验'通义千问'，领取免费token。
                  </div>

                  <div className="text-md text-default-500 p-1">
                    3. 点击左侧面板，'API-KEY管理'生成API Key。
                  </div>
                  <div className="text-md text-default-500 p-1">
                    4. 将Api key填写到上面的设置中
                  </div>
                  <p>联系作者:congxiaobai1233@gmail.com</p>
                </div>
              </CardFooter>
            </Card>
          </Tab>
          <Tab
            key="coze"
            className="flex-1"
            title={<div className="p-2">扣子</div>}
          >
            <Card>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex flex-col">
                  <p className="text-md">字节跳动出品</p>
                </div>
              </CardHeader>
              <CardBody>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum.
              </CardBody>
            </Card>
          </Tab>

          <Tab
              key="doubao"
              className="flex-1"
              title={<div className="p-2">豆包(豆包大模型)</div>}
          >
            <Card>
              <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                <div className="flex flex-col">
                  <h4 className="text-md">字节跳动出品</h4>
                  <p className="text-small text-default-500">
                    指定时间内申请5亿免费token
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <DouBao></DouBao>
              </CardBody>
              <Divider className="mt-2 mb-2" />
              <CardFooter>
                <div className="flex-col gap-2">
                  <div> 申请指南</div>
                  <div className="text-md text-default-500 p-1">
                    1.{' '}
                    <Link
                        href="https://console.volcengine.com/auth/login?redirectURI=%2Fark%2Fregion%3Aark%2Bcn-beijing%2FopenManagement%3Fcurrent%3D1%26pageSize%3D10"
                        isExternal={true}
                    >
                      点击这里
                    </Link>
                    进入控制台申请免费5亿token
                  </div>
                  <div className="text-md text-default-500 p-1">
                    2. <Link
                      href="https://www.volcengine.com/docs/82379/1099522"
                      isExternal={true}
                  >  点击这里
                  </Link>
                    创建接入点。
                  </div>

                  <div className="text-md text-default-500 p-1">
                    3. <Link
                      href="https://www.volcengine.com/docs/82379/1263279"
                      isExternal={true}
                  >  点击这里
                  </Link>
                    获取Api key。
                  </div>
                  <div className="text-md text-default-500 p-1">
                    4. 将Api key和接入点Id填写到上面的设置中
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Tab>

          <Tab
            key="words"
            className="flex-1"
            title={<div className="p-2">单词本</div>}
          >
            <Card>
              <Words></Words>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
